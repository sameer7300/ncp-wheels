import styled, { css } from 'styled-components'

interface CardProps {
  variant?: 'elevation' | 'outlined'
  elevation?: 1 | 2 | 3 | 4
  noPadding?: boolean
  fullWidth?: boolean
}

const getElevationShadow = (elevation: number, theme: any) => {
  const shadows = {
    1: theme.shadows.sm,
    2: theme.shadows.md,
    3: theme.shadows.lg,
    4: theme.shadows.xl,
  }
  return shadows[elevation as keyof typeof shadows] || shadows[1]
}

export const Card = styled.div<CardProps>`
  ${({ theme, variant = 'elevation', elevation = 1, noPadding, fullWidth }) => css`
    background-color: ${theme.colors.background.paper};
    border-radius: ${theme.borderRadius.lg};
    width: ${fullWidth ? '100%' : 'auto'};
    padding: ${noPadding ? 0 : theme.spacing.lg};
    
    ${variant === 'elevation'
      ? css`
          box-shadow: ${getElevationShadow(elevation, theme)};
        `
      : css`
          border: 1px solid ${theme.colors.border};
        `}
  `}
`

export const CardHeader = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: ${theme.spacing.md};
    margin-bottom: ${theme.spacing.md};
    border-bottom: 1px solid ${theme.colors.border};

    h1, h2, h3, h4, h5, h6 {
      margin: 0;
      color: ${theme.colors.text.primary};
    }
  `}
`

export const CardTitle = styled.h2`
  ${({ theme }) => css`
    font-size: ${theme.typography.h3.fontSize};
    font-weight: ${theme.typography.h3.fontWeight};
    line-height: ${theme.typography.h3.lineHeight};
    color: ${theme.colors.text.primary};
    margin: 0;
  `}
`

export const CardContent = styled.div<{ noPadding?: boolean }>`
  ${({ theme, noPadding }) => css`
    padding: ${noPadding ? 0 : theme.spacing.md};
    color: ${theme.colors.text.primary};
  `}
`

export const CardFooter = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: ${theme.spacing.md};
    padding-top: ${theme.spacing.md};
    margin-top: ${theme.spacing.md};
    border-top: 1px solid ${theme.colors.border};
  `}
`

export const CardActions = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: ${theme.spacing.sm};
  `}
`
