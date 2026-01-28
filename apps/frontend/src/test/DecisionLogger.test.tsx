import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DecisionLogger from '../pages/DecisionLogger'

const createMockResponse = (data: unknown, ok = true, status = 200) =>
  Promise.resolve({
    ok,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as Response)

describe('DecisionLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      createMockResponse({
        decision: {
          id: 'decision-1',
          title: 'Use TypeScript',
          summary: 'Enforce type safety',
          context: '',
          decision: 'We will use TypeScript',
          consequences: '',
          tags: ['infra'],
          status: 'accepted',
          date: new Date().toISOString(),
          path: 'decisions/2026/2026-01-28--use-typescript.md',
          url: 'https://github.com/org/repo/blob/main/decisions/2026/2026-01-28--use-typescript.md',
          commitUrl: 'https://github.com/org/repo/commit/abc123',
        },
      })
    )
  })

  it('renders with initial state', () => {
    render(<DecisionLogger />)

    expect(screen.getByText('Decision Logger')).toBeInTheDocument()
    expect(screen.getByText(/Log and track architecture decisions/)).toBeInTheDocument()
    expect(screen.getByText('Log New Decision')).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Summary')).toBeInTheDocument()
    expect(screen.getByLabelText('Context')).toBeInTheDocument()
    expect(screen.getByLabelText('Decision')).toBeInTheDocument()
    expect(screen.getByLabelText('Consequences')).toBeInTheDocument()
    expect(screen.getByLabelText('Tags')).toBeInTheDocument()
    expect(screen.getByLabelText('Status')).toBeInTheDocument()
    expect(screen.getByText('Save Decision')).toBeInTheDocument()
  })

  it('shows error when title and decision are empty', () => {
    render(<DecisionLogger />)

    const saveButton = screen.getByText('Save Decision')
    fireEvent.click(saveButton)

    expect(screen.getByText('Title and decision are required')).toBeInTheDocument()
  })

  it('shows error when only title is provided', () => {
    render(<DecisionLogger />)

    const titleInput = screen.getByLabelText('Title') as HTMLInputElement
    fireEvent.change(titleInput, { target: { value: 'Test Decision' } })

    const saveButton = screen.getByText('Save Decision')
    fireEvent.click(saveButton)

    expect(screen.getByText('Title and decision are required')).toBeInTheDocument()
  })

  it('shows error when only decision is provided', () => {
    render(<DecisionLogger />)

    const decisionInput = screen.getByLabelText('Decision') as HTMLTextAreaElement
    fireEvent.change(decisionInput, { target: { value: 'We should do this' } })

    const saveButton = screen.getByText('Save Decision')
    fireEvent.click(saveButton)

    expect(screen.getByText('Title and decision are required')).toBeInTheDocument()
  })

  it('saves decision with title and decision', async () => {
    render(<DecisionLogger />)

    const titleInput = screen.getByLabelText('Title') as HTMLInputElement
    fireEvent.change(titleInput, { target: { value: 'Use TypeScript' } })

    const decisionInput = screen.getByLabelText('Decision') as HTMLTextAreaElement
    fireEvent.change(decisionInput, { target: { value: 'We will use TypeScript for all new components' } })

    const saveButton = screen.getByText('Save Decision')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText('Recent Decisions')).toBeInTheDocument()
      expect(screen.getByText('Use TypeScript')).toBeInTheDocument()
    })
  })

  it('saves decision with all fields', async () => {
    render(<DecisionLogger />)

    const titleInput = screen.getByLabelText('Title') as HTMLInputElement
    fireEvent.change(titleInput, { target: { value: 'Use TypeScript' } })

    const summaryInput = screen.getByLabelText('Summary') as HTMLTextAreaElement
    fireEvent.change(summaryInput, { target: { value: 'Enforce type safety' } })

    const contextInput = screen.getByLabelText('Context') as HTMLTextAreaElement
    fireEvent.change(contextInput, { target: { value: 'We need type safety for our growing codebase' } })

    const decisionInput = screen.getByLabelText('Decision') as HTMLTextAreaElement
    fireEvent.change(decisionInput, { target: { value: 'We will use TypeScript for all new components' } })

    const consequencesInput = screen.getByLabelText('Consequences') as HTMLTextAreaElement
    fireEvent.change(consequencesInput, { target: { value: 'Better IDE support, fewer runtime errors' } })

    const saveButton = screen.getByText('Save Decision')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText('Recent Decisions')).toBeInTheDocument()
      expect(screen.getByText('Use TypeScript')).toBeInTheDocument()
      expect(screen.getByText('Enforce type safety')).toBeInTheDocument()
    })
  })

  it('clears form after saving', async () => {
    render(<DecisionLogger />)

    const titleInput = screen.getByLabelText('Title') as HTMLInputElement
    fireEvent.change(titleInput, { target: { value: 'Use TypeScript' } })

    const decisionInput = screen.getByLabelText('Decision') as HTMLTextAreaElement
    fireEvent.change(decisionInput, { target: { value: 'We will use TypeScript' } })

    const saveButton = screen.getByText('Save Decision')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(titleInput.value).toBe('')
      expect((decisionInput as HTMLTextAreaElement).value).toBe('')
    })
  })

  it('displays multiple decisions in reverse chronological order', async () => {
    render(<DecisionLogger />)

    const titleInput = screen.getByLabelText('Title') as HTMLInputElement
    const decisionInput = screen.getByLabelText('Decision') as HTMLTextAreaElement

    // First decision
    fireEvent.change(titleInput, { target: { value: 'First Decision' } })
    fireEvent.change(decisionInput, { target: { value: 'First content' } })
    const saveButton = screen.getByText('Save Decision')
    fireEvent.click(saveButton)

    await waitFor(() => {
      const decisionTitles = screen.getAllByText(/Decision/)
      expect(decisionTitles[0].textContent).toBe('Use TypeScript')
    })

    // Second decision
    fireEvent.change(titleInput, { target: { value: 'Second Decision' } })
    fireEvent.change(decisionInput, { target: { value: 'Second content' } })
    fireEvent.click(saveButton)

    await waitFor(() => {
      const decisionTitles = screen.getAllByText(/Decision/)
      expect(decisionTitles[0].textContent).toBe('Second Decision')
    })
  })

  it('copies decision to clipboard', async () => {
    const mockClipboard = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText: mockClipboard } })

    render(<DecisionLogger />)

    const titleInput = screen.getByLabelText('Title') as HTMLInputElement
    fireEvent.change(titleInput, { target: { value: 'Use TypeScript' } })

    const decisionInput = screen.getByLabelText('Decision') as HTMLTextAreaElement
    fireEvent.change(decisionInput, { target: { value: 'We will use TypeScript' } })

    const saveButton = screen.getByText('Save Decision')
    fireEvent.click(saveButton)

    await waitFor(() => {
      const copyButton = screen.getByTitle('Copy decision')
      fireEvent.click(copyButton)
      expect(mockClipboard).toHaveBeenCalledWith('We will use TypeScript')
    })

    vi.restoreAllMocks()
  })

  it('displays decision with all fields', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      createMockResponse({
        decision: {
          id: 'decision-full',
          title: 'Full Decision Test',
          summary: 'Complete ADR',
          context: 'We need more structure',
          decision: 'Use ADR format',
          consequences: 'Better documentation',
          tags: ['docs', 'architecture'],
          status: 'accepted',
          date: new Date().toISOString(),
          path: 'decisions/2026/2026-01-28--full-decision-test.md',
          url: 'https://github.com/org/repo/blob/main/decisions/2026/2026-01-28--full-decision-test.md',
          commitUrl: 'https://github.com/org/repo/commit/def456',
        },
      })
    )

    render(<DecisionLogger />)

    const titleInput = screen.getByLabelText('Title') as HTMLInputElement
    fireEvent.change(titleInput, { target: { value: 'Full Decision Test' } })

    const saveButton = screen.getByText('Save Decision')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText('Full Decision Test')).toBeInTheDocument()
      expect(screen.getByText('Complete ADR')).toBeInTheDocument()
      expect(screen.getByText('We need more structure')).toBeInTheDocument()
      expect(screen.getByText('Use ADR format')).toBeInTheDocument()
      expect(screen.getByText('Better documentation')).toBeInTheDocument()
      expect(screen.getByText('docs, architecture')).toBeInTheDocument()
    })
  })

  it('shows status badges for non-accepted decisions', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      createMockResponse({
        decision: {
          id: 'decision-rejected',
          title: 'Rejected Decision',
          summary: 'Not going to do this',
          context: 'Considered but rejected',
          decision: 'We decided against it',
          consequences: 'Too complex',
          tags: ['rejected'],
          status: 'rejected',
          date: new Date().toISOString(),
          path: 'decisions/2026/2026-01-28--rejected-decision.md',
          url: 'https://github.com/org/repo/blob/main/decisions/2026/2026-01-28--rejected-decision.md',
          commitUrl: 'https://github.com/org/repo/commit/ghi789',
        },
      })
    )

    render(<DecisionLogger />)

    const titleInput = screen.getByLabelText('Title') as HTMLInputElement
    fireEvent.change(titleInput, { target: { value: 'Rejected Decision' } })

    const saveButton = screen.getByText('Save Decision')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText('rejected')).toBeInTheDocument()
      const statusBadge = screen.getByText('rejected')
      expect(statusBadge).toHaveClass('decision-status')
    })
  })

  it('disables save button when title and decision are empty', () => {
    render(<DecisionLogger />)

    const saveButton = screen.getByText('Save Decision')
    expect(saveButton).toBeDisabled()
  })

  it('enables save button when title and decision are provided', () => {
    render(<DecisionLogger />)

    const titleInput = screen.getByLabelText('Title') as HTMLInputElement
    fireEvent.change(titleInput, { target: { value: 'Test' } })

    const decisionInput = screen.getByLabelText('Decision') as HTMLTextAreaElement
    fireEvent.change(decisionInput, { target: { value: 'Content' } })

    const saveButton = screen.getByText('Save Decision')
    expect(saveButton).toBeEnabled()
  })

  it('hides recent decisions when none are logged', () => {
    render(<DecisionLogger />)
    expect(screen.queryByText('Recent Decisions')).not.toBeInTheDocument()
  })

  it('shows recent decisions after logging', async () => {
    render(<DecisionLogger />)

    const titleInput = screen.getByLabelText('Title') as HTMLInputElement
    fireEvent.change(titleInput, { target: { value: 'Test Decision' } })

    const decisionInput = screen.getByLabelText('Decision') as HTMLTextAreaElement
    fireEvent.change(decisionInput, { target: { value: 'Test content' } })

    const saveButton = screen.getByText('Save Decision')
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText('Recent Decisions')).toBeInTheDocument()
      expect(screen.getByText('Test Decision')).toBeInTheDocument()
    })
  })
})
