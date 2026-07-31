import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserProfile {
  id: string
  username: string
  email: string
  name?: string
}

interface AuthState {
  profile: UserProfile | null
  accessToken: string | null
  setProfile: (profile: UserProfile | null, accessToken?: string) => void
  setAccessToken: (token: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      profile: null,
      accessToken: null,
      setProfile: (profile, accessToken) => set((state) => ({ profile, accessToken: accessToken !== undefined ? accessToken : state.accessToken })),
      setAccessToken: (accessToken) => set({ accessToken }),
      logout: () => set({ profile: null, accessToken: null }),
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
    }
  )
)
