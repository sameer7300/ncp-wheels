import { forwardRef } from 'react'
import styled, { css } from 'styled-components'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | boolean
  fullWidth?: boolean
  startAdornment?: React.ReactNode
  endAdornment?: React.ReactNode
  helperText?: string
  label?: string
  required?: boolean
  size?: 'small' | 'medium' | 'large'
}

const InputWrapper = styled.div<{ fullWidth?: boolean }>`
  display: inline-flex;
  flex-direction: column;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`

const Label = styled.label<{ error?: boolean }>`
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  color: ${({ theme, error }) =>
    error ? theme.colors.error : theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`

const Adornment = styled.div<{ position: 'start' | 'end' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ position, theme }) =>
    position === 'start'
      ? css`
          left: ${theme.spacing.sm};
        `
      : css`
          right: ${theme.spacing.sm};
        `}
`

const StyledInput = styled.input<{
  error?: boolean | string
  hasStartAdornment?: boolean
  hasEndAdornment?: boolean
  size?: 'small' | 'medium' | 'large'
}>`
  ${({ theme, error, hasStartAdornment, hasEndAdornment, size = 'medium' }) => css`
    width: 100%;
    border: 1px solid ${error ? theme.colors.error : theme.colors.border};
    border-radius: ${theme.borderRadius.md};
    background-color: ${theme.colors.background.paper};
    color: ${theme.colors.text.primary};
    font-size: ${theme.typography.body1.fontSize};
    
    padding: ${
      size === 'small'
        ? theme.spacing.xs
        : size === 'large'
        ? theme.spacing.lg
        : theme.spacing.md
    };
    
    padding-left: ${hasStartAdornment ? theme.spacing.xl : theme.spacing.md};
    padding-right: ${hasEndAdornment ? theme.spacing.xl : theme.spacing.md};

    &::placeholder {
      color: ${theme.colors.text.secondary};
    }

    &:focus {
      outline: none;
      border-color: ${error ? theme.colors.error : theme.colors.primary};
      box-shadow: 0 0 0 2px ${error ? theme.colors.error : theme.colors.primary}20;
    }

    &:disabled {
      background-color: ${theme.colors.background.default};
      cursor: not-allowed;
      opacity: 0.7;
    }
  `}
`

const HelperText = styled.span<{ error?: boolean }>`
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  color: ${({ theme, error }) =>
    error ? theme.colors.error : theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing.xs};
`

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      error,
      fullWidth = false,
      startAdornment,
      endAdornment,
      helperText,
      label,
      required,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <InputWrapper fullWidth={fullWidth} className={className}>
        {label && (
          <Label error={!!error}>
            {label} {required && '*'}
          </Label>
        )}
        <InputContainer>
          {startAdornment && (
            <Adornment position="start">{startAdornment}</Adornment>
          )}
          <StyledInput
            ref={ref}
            error={!!error}
            hasStartAdornment={!!startAdornment}
            hasEndAdornment={!!endAdornment}
            aria-invalid={!!error}
            {...props}
          />
          {endAdornment && <Adornment position="end">{endAdornment}</Adornment>}
        </InputContainer>
        {(helperText || error) && (
          <HelperText error={!!error}>
            {typeof error === 'string' ? error : helperText}
          </HelperText>
        )}
      </InputWrapper>
    )
  }
)
