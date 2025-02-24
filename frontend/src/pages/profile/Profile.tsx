import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import styled from 'styled-components'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { useAuth } from '../../contexts/AuthContext'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
`

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.h2.fontSize};
  font-weight: ${({ theme }) => theme.typography.h2.fontWeight};
  line-height: ${({ theme }) => theme.typography.h2.lineHeight};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`

const FormSection = styled.div`
  background-color: ${({ theme }) => theme.colors.background.paper};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.h3.fontSize};
  font-weight: ${({ theme }) => theme.typography.h3.fontWeight};
  line-height: ${({ theme }) => theme.typography.h3.lineHeight};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
`

const ErrorMessage = styled.span`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.body2.fontSize};
  margin-top: ${({ theme }) => theme.spacing.xs};
`

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xl};
`

const AvatarSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
`

const Avatar = styled.div<{ url?: string }>`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.background.paper};
  background-image: url(${({ url }) => url});
  background-size: cover;
  background-position: center;
`

export function ProfilePage() {
  const { user } = useAuth()
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      bio: user?.bio || '',
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // TODO: Implement profile update API call
      console.log('Profile data:', data)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Container>
      <Title>Profile Settings</Title>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormSection>
          <SectionTitle>Profile Picture</SectionTitle>
          <AvatarSection>
            <Avatar url={avatarPreview || user?.avatar} />
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
                id="avatar-input"
              />
              <Button
                as="label"
                htmlFor="avatar-input"
                variant="secondary"
              >
                Change Photo
              </Button>
            </div>
          </AvatarSection>
        </FormSection>

        <FormSection>
          <SectionTitle>Basic Information</SectionTitle>
          <InputGroup>
            <Label>Full Name</Label>
            <Input
              {...register('fullName')}
              disabled={!isEditing}
              error={errors.fullName?.message}
            />
            {errors.fullName && (
              <ErrorMessage>{errors.fullName.message}</ErrorMessage>
            )}
          </InputGroup>

          <InputGroup>
            <Label>Email</Label>
            <Input
              {...register('email')}
              type="email"
              disabled={!isEditing}
              error={errors.email?.message}
            />
            {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <Label>Phone Number</Label>
            <Input
              {...register('phone')}
              type="tel"
              disabled={!isEditing}
              error={errors.phone?.message}
            />
            {errors.phone && <ErrorMessage>{errors.phone.message}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <Label>Location</Label>
            <Input
              {...register('location')}
              disabled={!isEditing}
              error={errors.location?.message}
            />
            {errors.location && (
              <ErrorMessage>{errors.location.message}</ErrorMessage>
            )}
          </InputGroup>

          <InputGroup>
            <Label>Bio</Label>
            <Input
              {...register('bio')}
              as="textarea"
              rows={4}
              disabled={!isEditing}
              error={errors.bio?.message}
            />
            {errors.bio && <ErrorMessage>{errors.bio.message}</ErrorMessage>}
          </InputGroup>
        </FormSection>

        <ButtonGroup>
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  reset()
                  setIsEditing(false)
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </>
          ) : (
            <Button type="button" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </ButtonGroup>
      </Form>
    </Container>
  )
}
