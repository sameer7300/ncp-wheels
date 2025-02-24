import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiUser } from 'react-icons/fi'
import { authService } from '../../services/auth'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import styled from 'styled-components'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>

const RegisterContainer = styled.div`
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

const RegisterCard = styled(motion.div)`
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

const RegisterTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
  text-align: center;
  background: linear-gradient(to right, #fff, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`

const RegisterSubtitle = styled.p`
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

const InputGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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

const RegisterButton = styled(Button)`
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

const PasswordRequirements = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  margin-top: -8px;
`

const RequirementText = styled.p<{ met: boolean }>`
  color: ${props => props.met ? '#10b981' : 'rgba(255, 255, 255, 0.5)'};
  font-size: 0.875rem;
  margin: 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${props => props.met ? '#10b981' : 'rgba(255, 255, 255, 0.5)'};
  }
`

export const RegisterPage = () => {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const watchPassword = watch('password', '')

  const passwordRequirements = [
    { text: 'At least 8 characters', met: watchPassword.length >= 8 },
    { text: 'One uppercase letter', met: /[A-Z]/.test(watchPassword) },
    { text: 'One lowercase letter', met: /[a-z]/.test(watchPassword) },
    { text: 'One number', met: /[0-9]/.test(watchPassword) },
    { text: 'One special character', met: /[^A-Za-z0-9]/.test(watchPassword) },
  ]

  const registerMutation = useMutation({
    mutationFn: (data: RegisterFormData) => authService.register(data),
    onSuccess: () => {
      navigate('/login')
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to register. Please try again.')
    },
  })

  const onSubmit = (data: RegisterFormData) => {
    setError(null)
    registerMutation.mutate(data)
  }

  return (
    <RegisterContainer>
      <RegisterCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <RegisterTitle>Create Account</RegisterTitle>
        <RegisterSubtitle>Join NCP Wheels today</RegisterSubtitle>
        
        {error && <ErrorText>{error}</ErrorText>}
        
        <Form onSubmit={handleSubmit(onSubmit)}>
          <InputGroup>
            <InputWrapper>
              <FiUser />
              <StyledInput
                {...register('firstName')}
                type="text"
                placeholder="First name"
                error={!!errors.firstName}
              />
              {errors.firstName && <ErrorText>{errors.firstName.message}</ErrorText>}
            </InputWrapper>

            <InputWrapper>
              <FiUser />
              <StyledInput
                {...register('lastName')}
                type="text"
                placeholder="Last name"
                error={!!errors.lastName}
              />
              {errors.lastName && <ErrorText>{errors.lastName.message}</ErrorText>}
            </InputWrapper>
          </InputGroup>

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
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <ErrorText>{errors.password.message}</ErrorText>}
          </InputWrapper>

          <InputWrapper>
            <FiLock />
            <StyledInput
              {...register('confirmPassword')}
              type="password"
              placeholder="Confirm password"
              error={!!errors.confirmPassword}
            />
            {errors.confirmPassword && <ErrorText>{errors.confirmPassword.message}</ErrorText>}
          </InputWrapper>

          <PasswordRequirements>
            {passwordRequirements.map((req, index) => (
              <RequirementText key={index} met={req.met}>
                {req.text}
              </RequirementText>
            ))}
          </PasswordRequirements>

          <RegisterButton
            type="submit"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
          </RegisterButton>
        </Form>

        <StyledLink to="/auth/login">
          Already have an account? Sign in
        </StyledLink>
      </RegisterCard>
    </RegisterContainer>
  )
}

export default RegisterPage
