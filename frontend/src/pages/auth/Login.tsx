import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FiMail, FiLock } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { authService } from '../../services/auth'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import styled from 'styled-components'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 150%;
    height: 150%;
    background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
    opacity: 0.15;
    top: -25%;
    left: -25%;
    animation: rotate 20s linear infinite;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`

const LoginCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 48px;
  border-radius: 24px;
  width: 100%;
  max-width: 440px;
  position: relative;
  z-index: 1;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`

const LoginTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
  text-align: center;
  background: linear-gradient(to right, #fff, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const LoginSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  margin-bottom: 32px;
  font-size: 1rem;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const InputWrapper = styled.div`
  position: relative;

  svg {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.5);
    font-size: 1.2rem;
  }
`

const StyledInput = styled(Input)<{ error?: boolean }>`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${props => props.error ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'};
  padding: 16px;
  padding-left: 48px;
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  width: 100%;
  transition: all 0.3s ease;

  &:focus {
    background: rgba(255, 255, 255, 0.1);
    border-color: #3b82f6;
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`

const ErrorText = styled.p`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
`

const StyledLink = styled(Link)`
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.875rem;
  text-align: center;
  margin-top: 24px;
  display: block;
  transition: color 0.3s ease;
  
  &:hover {
    color: #60a5fa;
    text-decoration: underline;
  }
`

const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 32px 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  &::before {
    margin-right: 16px;
  }

  &::after {
    margin-left: 16px;
  }
`

const DividerText = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
`

const SocialButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px;
  width: 100%;
  border-radius: 12px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  svg {
    font-size: 1.4rem;
  }
`

const LoginButton = styled(Button)`
  background: #3b82f6;
  color: white;
  padding: 16px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  width: 100%;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: #2563eb;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`

export const LoginPage = () => {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      return authService.login(data)
    },
    onSuccess: () => {
      navigate('/')
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to login. Please try again.')
    },
  })

  const googleLoginMutation = useMutation({
    mutationFn: () => authService.loginWithGoogle(),
    onSuccess: () => {
      navigate('/')
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to login with Google. Please try again.')
    },
  })

  const onSubmit = (data: LoginFormData) => {
    setError(null)
    loginMutation.mutate(data)
  }

  const handleGoogleLogin = () => {
    setError(null)
    googleLoginMutation.mutate()
  }

  return (
    <LoginContainer>
      <LoginCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LoginTitle>Welcome Back</LoginTitle>
        <LoginSubtitle>Sign in to continue to NCP Wheels</LoginSubtitle>
        
        {error && (
          <ErrorText>
            {error}
          </ErrorText>
        )}
        
        <Form onSubmit={handleSubmit(onSubmit)}>
          <InputWrapper>
            <FiMail />
            <StyledInput
              {...register('email')}
              type="email"
              placeholder="Email address"
              error={!!errors.email}
            />
            {errors.email && <ErrorText>{errors.email.message}</ErrorText>}
          </InputWrapper>

          <InputWrapper>
            <FiLock />
            <StyledInput
              {...register('password')}
              type="password"
              placeholder="Password"
              error={!!errors.password}
            />
            {errors.password && <ErrorText>{errors.password.message}</ErrorText>}
          </InputWrapper>

          <LoginButton
            type="submit"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
          </LoginButton>
        </Form>

        <Divider>
          <DividerText>or continue with</DividerText>
        </Divider>

        <SocialButton
          as={motion.button}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGoogleLogin}
          disabled={googleLoginMutation.isPending}
        >
          <FcGoogle /> Continue with Google
        </SocialButton>

        <StyledLink to="/auth/register">
          Don't have an account? Sign up
        </StyledLink>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage
