import { render, screen } from '@testing-library/react'
import { TournamentForm } from '@/components/tournaments/TournamentForm'

describe('TournamentForm Component', () => {
  const mockOnSubmit = jest.fn()
  const mockOnCancel = jest.fn()

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    submitText: 'CREATE TOURNAMENT',
    loading: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders basic form structure', () => {
    render(<TournamentForm {...defaultProps} />)

    // Check for section headers
    expect(screen.getByText('BASIC INFORMATION')).toBeInTheDocument()
    expect(screen.getByText('SCHEDULE & LOCATION')).toBeInTheDocument()
    expect(screen.getByText('FINANCIAL DETAILS')).toBeInTheDocument()
    expect(screen.getByText('ADDITIONAL INFORMATION')).toBeInTheDocument()

    // Check for buttons
    expect(screen.getByRole('button', { name: /create tournament/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('renders form fields', () => {
    render(<TournamentForm {...defaultProps} />)

    // Check for form inputs
    expect(screen.getByText('Battlefield 2042')).toBeInTheDocument() // game option
    expect(screen.getByText('32v32')).toBeInTheDocument() // mode option
    expect(screen.getByDisplayValue('1024')).toBeInTheDocument() // max players
    expect(screen.getByText('North America')).toBeInTheDocument() // region option
    expect(screen.getByText('PC')).toBeInTheDocument() // platform option
    expect(screen.getByDisplayValue('English')).toBeInTheDocument() // language
    expect(screen.getByText('Single Elimination')).toBeInTheDocument() // bracket type option
  })

  it('defaults to 32v32 mode with correct max players', () => {
    render(<TournamentForm {...defaultProps} />)

    // Mode should default to 32v32
    expect(screen.getByText('32v32')).toBeInTheDocument()

    // Max players should default to 1024 for 32v32
    const maxPlayersInput = screen.getByDisplayValue('1024') as HTMLInputElement
    expect(maxPlayersInput).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', () => {
    render(<TournamentForm {...defaultProps} />)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    cancelButton.click()

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('renders with custom submit text', () => {
    render(<TournamentForm {...defaultProps} submitText="SAVE CHANGES" />)
    
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })
})
