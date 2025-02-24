import styled, { css } from 'styled-components'
import { forwardRef } from "react"
import { cn } from "../../lib/utils"

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outlined'
  | 'text'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'

type ButtonSize = 'small' | 'medium' | 'large'

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  disabled?: boolean
  loading?: boolean
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

const getButtonColors = (variant: ButtonVariant, theme: any) => {
  switch (variant) {
    case 'primary':
      return css`
        color: ${theme.colors.text.light};
        background: ${theme.colors.primary};
        &:hover:not(:disabled) {
          background: ${theme.colors.primaryHover};
        }
      `
    case 'secondary':
      return css`
        color: ${theme.colors.text.light};
        background: ${theme.colors.secondary};
        &:hover:not(:disabled) {
          background: ${theme.colors.secondaryHover};
        }
      `
    case 'outlined':
      return css`
        color: ${theme.colors.primary};
        border: 1px solid ${theme.colors.primary};
        background: transparent;
        &:hover:not(:disabled) {
          background: ${theme.colors.primary}20;
        }
      `
    case 'text':
      return css`
        color: ${theme.colors.primary};
        background: transparent;
        &:hover:not(:disabled) {
          background: ${theme.colors.primary}10;
        }
      `
    case 'success':
      return css`
        color: ${theme.colors.text.light};
        background: ${theme.colors.success};
        &:hover:not(:disabled) {
          filter: brightness(90%);
        }
      `
    case 'error':
      return css`
        color: ${theme.colors.text.light};
        background: ${theme.colors.error};
        &:hover:not(:disabled) {
          filter: brightness(90%);
        }
      `
    case 'warning':
      return css`
        color: ${theme.colors.text.primary};
        background: ${theme.colors.warning};
        &:hover:not(:disabled) {
          filter: brightness(90%);
        }
      `
    case 'info':
      return css`
        color: ${theme.colors.text.light};
        background: ${theme.colors.info};
        &:hover:not(:disabled) {
          filter: brightness(90%);
        }
      `
    default:
      return css`
        color: ${theme.colors.text.light};
        background: ${theme.colors.primary};
        &:hover:not(:disabled) {
          background: ${theme.colors.primaryHover};
        }
      `
  }
}

const getButtonSize = (size: ButtonSize, theme: any) => {
  const sizes = {
    small: {
      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
      fontSize: theme.typography.body2.fontSize,
    },
    medium: {
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      fontSize: theme.typography.body1.fontSize,
    },
    large: {
      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
      fontSize: theme.typography.h3.fontSize,
    },
  }

  return sizes[size] || sizes.medium
}

const ButtonBase = styled.button<ButtonProps>`
  ${({ theme, variant = 'primary', size = 'medium', fullWidth, disabled, loading }) => css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.sm};
    border: none;
    border-radius: ${theme.borderRadius.md};
    font-weight: 500;
    cursor: ${disabled ? 'not-allowed' : 'pointer'};
    width: ${fullWidth ? '100%' : 'auto'};
    opacity: ${disabled ? 0.5 : 1};
    position: relative;
    white-space: nowrap;

    ${getButtonColors(variant, theme)}
    ${getButtonSize(size, theme)}

    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px ${theme.colors.background.default}, 0 0 0 4px ${theme.colors.primary};
    }

    &:disabled {
      cursor: not-allowed;
    }

    ${loading && css`
      color: transparent !important;
      pointer-events: none;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        width: 1em;
        height: 1em;
        margin: -0.5em;
        border: 2px solid currentColor;
        border-right-color: transparent;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}
  `}
`

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, startIcon, endIcon, ...props }, ref) => {
    return (
      <ButtonBase className={cn('', className)} ref={ref} {...props}>
        {startIcon && <span className="start-icon">{startIcon}</span>}
        {children}
        {endIcon && <span className="end-icon">{endIcon}</span>}
      </ButtonBase>
    )
  }
)
