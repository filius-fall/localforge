# Mock API Server Backend Implementation

MOCK_DATA_FILE = Path('.data/mock_routes.json')
MOCK_ROUTES_DIR = Path('.data')

# Ensure data directory exists
def _ensure_data_directory():
    MOCK_ROUTES_DIR.mkdir(parents=True, exist_ok=True)
    if not MOCK_DATA_FILE.exists():
        _save_routes([])
        logger.info('mock.init: initialized empty routes')

def _save_routes(routes: list):
    MOCK_ROUTES_DIR.mkdir(parents=True, exist_ok=True)
    with open(MOCK_DATA_FILE, 'w') as f:
        import json
        json.dump({
            'version': 1,
            'updatedAt': datetime.now(timezone.utc).isoformat(),
            'routes': routes
        }, f, indent=2)

def _load_routes() -> list:
    if not MOCK_DATA_FILE.exists():
        _ensure_data_directory()
    try:
        with open(MOCK_DATA_FILE, 'r') as f:
            data = json.load(f)
            return data.get('routes', [])
    except Exception:
        logger.warning('mock.load_failed: routes not found, initializing')
        _ensure_data_directory()
        return []

# Mock route model
class MockRoute(BaseModel):
    id: str
    method: str
    path: str
    status: int
    headers: dict[str, str]
    body: Any
    delay_ms: int
    enabled: bool
    created_at: str
    updated_at: str

# Sensitive headers to redact
SENSITIVE_HEADERS = frozenset([
    'authorization', 'cookie', 'set-cookie',
    'x-api-key', 'proxy-authorization'
])

def _is_sensitive_header(header_name: str) -> bool:
    return header_name.lower() in SENSITIVE_HEADERS

@app.get("/api/mock/routes", response_class=Response)
async def list_routes() -> Response:
    routes = _load_routes()
    return {'routes': routes}

@app.post("/api/mock/routes", response_class=Response)
async def create_route(route: MockRoute) -> Response:
    routes = _load_routes()
    
    # Validation
    if not route.path.startswith('/') or route.path.startswith('/api') or route.path.startswith('/mock'):
        raise HTTPException(status_code=400, detail='Path must start with / and cannot be /api or /mock')
    if not (200 <= route.status <= 599):
        raise HTTPException(status_code=400, detail='Status must be 200-599')
    if route.delay_ms < 0 or route.delay_ms > 10000:
        raise HTTPException(status_code=400, detail='Delay must be 0-10000ms')
    
    # Validate body if Content-Type is JSON
    content_type = route.headers.get('Content-Type', '').lower()
    if content_type == 'application/json':
        try:
            json.loads(route.body)
        except Exception:
            raise HTTPException(status_code=400, detail='Body must be valid JSON when Content-Type is application/json')
    
    # Body size limit (512KB)
    if route.body and len(str(route.body)) > 524288:
        raise HTTPException(status_code=400, detail='Body exceeds 512KB limit')
    
    new_route = MockRoute(
        id=str(uuid.uuid4()),
        method=route.method,
        path=route.path,
        status=route.status,
        headers=route.headers,
        body=route.body,
        delay_ms=route.delay_ms,
        enabled=route.enabled,
        created_at=datetime.now(timezone.utc).isoformat(),
        updated_at=datetime.now(timezone.utc).isoformat()
    )
    
    routes.append(new_route)
    _save_routes(routes)
    
    logger.info('mock.route.created id=%s path=%s', new_route.id, new_route.path)
    return {'route': new_route.model_dump()}

@app.put("/api/mock/routes/{route_id}", response_class=Response)
async def update_route(route_id: str, route: MockRoute) -> Response:
    routes = _load_routes()
    route_index = next((r for r in routes if r.id == route_id), None)
    
    if not route_index:
        raise HTTPException(status_code=404, detail='Route not found')
    
    # Same validation as create
    if not route.path.startswith('/') or route.path.startswith('/api') or route.path.startswith('/mock'):
        raise HTTPException(status_code=400, detail='Path must start with / and cannot be /api or /mock')
    if not (200 <= route.status <= 599):
        raise HTTPException(status_code=400, detail='Status must be 200-599')
    if route.delay_ms < 0 or route.delay_ms > 10000:
        raise HTTPException(status_code=400, detail='Delay must be 0-10000ms')
    
    # Update fields
    if route.path != route_index.path or route.method != route_index.method:
        route_index.path = route.path
        route_index.method = route.method
    
    route_index.status = route.status
    route_index.headers = route.headers
    route_index.body = route.body
    route_index.delay_ms = route.delay_ms
    route_index.enabled = route.enabled
    route_index.updated_at = datetime.now(timezone.utc).isoformat()
    
    _save_routes(routes)
    
    logger.info('mock.route.updated id=%s', route_id)
    return {'route': route_index.model_dump()}

@app.delete("/api/mock/routes/{route_id}", response_class=Response)
async def delete_route(route_id: str) -> Response:
    routes = _load_routes()
    route_index = next((r for r in routes if r.id == route_id), None)
    
    if not route_index:
        raise HTTPException(status_code=404, detail='Route not found')
    
    routes.remove(route_index)
    _save_routes(routes)
    
    logger.info('mock.route.deleted id=%s', route_id)
    return {'deleted': True}

# Mock request handling at /mock/*
async def handle_mock_request(request: Request) -> Response:
    method = request.method
    path = request.url.path
    query = request.url.query
    strip_path = path.rstrip('?')
    if not strip_path:
        strip_path = '/'
    
    logger.info('mock.hit method=%s path=%s status=200', method, path)
    
    routes = _load_routes()
    
    # Find matching route
    for route in routes:
        if not route.enabled:
            continue
        
        if route.method != method:
            continue
        
        if route.path != strip_path and not (strip_path.startswith(route.path) or route.path.startswith('/')):
            # Partial path match
            if query and query:
                continue
        elif route.path == strip_path:
            # Exact path match
            logger.info('mock.match route_id=%s', route.id)
            
            # Delay
            if route.delay_ms > 0:
                import asyncio
                await asyncio.sleep(route.delay_ms / 1000)
            
            # Build headers for logging (redact sensitive values)
            headers_to_log = {
                k: v if not _is_sensitive_header(k) else 'REDACTED',
                v for k, v in route.headers.items()
            }
            logger.info('mock.headers %s', headers_to_log)
            
            # Prepare response
            status_code = route.status
            response_headers = {
                'Content-Type': 'application/json' if route.headers.get('Content-Type') else 'text/plain',
                'X-Request-Id': str(uuid.uuid4())[:12]
            }
            
            if route.body:
                response_body = route.body
            else:
                response_body = None
            
            response = Response(
                content=response_body,
                status_code=status_code,
                headers=response_headers
            )
            
            return response
    
    logger.info('mock.miss no matching route for method=%s path=%s', method, path)
    return Response(
        status_code=404,
        content={'error': 'No matching mock route', 'method': method, 'path': path}
    )

@app.get("/api/mock/{path:path}")
async def get_mock(path: str):
    response = await handle_mock_request(Request(method='GET', url=URL(f'/{path}')))
    return response

@app.post("/api/mock/{path:path}")
async def post_mock(path: str):
    response = await handle_mock_request(Request(method='POST', url=URL(f'/{path}')))
    return response

@app.put("/api/mock/{path:path}")
async def put_mock(path: str):
    response = await handle_mock_request(Request(method='PUT', url=URL(f'/{path}')))
    return response

@app.delete("/api/mock/{path:path}")
async def delete_mock(path: str):
    response = await handle_mock_request(Request(method='DELETE', url=URL(f'/{path}')))
    return response
