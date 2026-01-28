import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DecisionLogger from '../DecisionLogger'

describe('DecisionLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with initial state', () => {
    render(<DecisionLogger />)

    expect(screen.getByText('Decision Logger')).toBeInTheDocument()
    expect(screen.getByText(/Log and track architecture decisions/)).toBeInTheDocument()
    expect(screen.getByText('Log New Decision')).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Context')).toBeInTheDocument()
    expect(screen.getByLabelText('Decision')).toBeInTheDocument()
    expect(screen.getByLabelText('Consequences')).toBeInTheDocument()
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

  it('saves decision with title and decision', () => {
    render(<DecisionLogger />)

    const titleInput = screen.getByLabelText('Title') as HTMLInputElement
    fireEvent.change(titleInput, { target: { value: 'Use TypeScript' } })

    const decisionInput = screen.getByLabelText('Decision') as HTMLTextAreaElement
    fireEvent.change(decisionInput, { target: { value: 'We will use TypeScript for all new components' } })

    const saveButton = screen.getByText('Save Decision')
    fireEvent.click(saveButton)

    expect(screen.getByText('Recent Decisions')).toBeInTheDocument()
    expect(screen.getByText('Use TypeScript')).toBeInTheDocument()
  })

  it('saves decision with all fields', () => {
    render(<DecisionLogger />)

    const titleInput = screen.getByLabelText('Title') as HTMLInputElement
    fireEvent.change(titleInput, { target: { value: 'Use TypeScript' } })

    const contextInput = screen.getByLabelText('Context') as HTMLTextAreaElement
    fireEvent.change(contextInput, { target: { value: 'We need type safety for our growing codebase' } })

    const decisionInput = screen.getByLabelText('Decision') as HTMLTextAreaElement
    fireEvent.change(decisionInput, { target: { value: 'We will use TypeScript for all new components' } })

    const consequencesInput = screen.getByLabelText('Consequences') as HTMLTextAreaElement
    fireEvent.change(consequencesInput, { target: { value: 'Better IDE support, fewer runtime errors' } })

    const saveButton = screen.getByText('Save Decision')
    fireEvent.click(saveButton)

    expect(screen.getByText('Recent Decisions')).toBeInTheDocument()
    expect(screen.getByText('Use TypeScript')).toBeInTheDocument()
    expect(screen.getByText('We need type safety for our growing codebase')).toBeInTheDocument()
    expect(screen.getByText('We will use TypeScript for all new components')).toBeInTheDocument()
    expect(screen.getByText('Better IDE support, fewer runtime errors')).toBeInTheDocument()
  })

  it('clears form after saving', () => {
    render(<DecisionLogger />)

    const titleInput = screen.getByLabelText('Title') as HTMLInputElement
    fireEvent.change(titleInput, { target: { value: 'Use TypeScript' } })

    const decisionInput = screen.getByLabelText('Decision') as HTMLTextAreaElement
    fireEvent.change(decisionInput, { target: { value: 'We will use TypeScript' } })

    const saveButton = screen.getByText('Save Decision')
    fireEvent.click(saveButton)

    expect(titleInput.value).toBe('')
    expect((decisionInput as HTMLTextAreaElement).value).toBe('')
  })

  it('displays multiple decisions in reverse chronological order', () => {
    render(<DecisionLogger />)

    const titleInput = screen.getByLabelText('Title') as HTMLInputElement
    const decisionInput = screen.getByLabelText('Decision') as HTMLTextAreaElement

    // First decision
    fireEvent.change(titleInput, { target: { value: 'First Decision' } })
    fireEvent.change(decisionInput, { target: { value: 'First content' } })

    const saveButton = screen.getByText('Save Decision')
    fireEvent.click(saveButton)

    // Second decision
    fireEvent.change(titleInput, { target: { value: 'Second Decision' } })
    fireEvent.change(decisionInput, { target: { value: 'Second content' } })

    fireEvent.click(saveButton)

    const decisionTitles = screen.getAllByText(/Decision/)
    expect(decisionTitles[0].textContent).toBe('Second Decision')
    expect(decisionTitles[1].textContent).toBe('First Decision')
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

    const copyButton = screen.getByTitle('Copy decision')
    fireEvent.click(copyButton)

    expect(mockClipboard).toHaveBeenCalledWith('We will use TypeScript')

    vi.restoreAllMocks()
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

  it('shows recent decisions after logging', () => {
    render(<DecisionLogger />)

    const titleInput = screen.getByLabelText('Title') as HTMLInputElement
    fireEvent.change(titleInput, { target: { value: 'Test Decision' } })

    const decisionInput = screen.getByLabelText('Decision') as HTMLTextAreaElement
    fireEvent.change(decisionInput, { target: { value: 'Test content' } })

    const saveButton = screen.getByText('Save Decision')
    fireEvent.click(saveButton)

    expect(screen.getByText('Recent Decisions')).toBeInTheDocument()
  })
})
