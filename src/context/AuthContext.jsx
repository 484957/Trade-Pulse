import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, signInWithGoogle, signInAsGoogleUser, logOutFromFirebase } from '../lib/firebase'
import { loginRequest } from '../lib/auth'
import api from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [firebaseUser, setFirebaseUser] = useState(null)
  const [ready, setReady] = useState(false)

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser)
      if (fbUser) {
        // Sync with backend session
        try {
          const res = await api.post('/api/v1/auth/firebase-login', {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
          })
          if (res.data?.success) {
            const result = res.data.data
            const nextUser = {
              merchantId: result.userId,
              tenantId: result.tenantId,
              username: result.username,
              displayName: result.displayName || fbUser.displayName,
              roles: result.roles,
              isGoogleUser: true,
              photoURL: fbUser.photoURL,
            }
            localStorage.setItem('tp_token', result.accessToken)
            localStorage.setItem('tp_admin_token', result.accessToken)
            localStorage.setItem('tp_user', JSON.stringify(nextUser))
            localStorage.setItem('tp_admin_user', JSON.stringify(nextUser))
            setUser(nextUser)
          }
        } catch (err) {
          console.warn('Failed to sync Firebase session with backend:', err?.message || err)
        }
      } else {
        const stored = localStorage.getItem('tp_user')
        const token = localStorage.getItem('tp_token')
        if (stored && token) {
          try {
            setUser(JSON.parse(stored))
          } catch {
            localStorage.removeItem('tp_user')
            localStorage.removeItem('tp_token')
          }
        }
      }
      setReady(true)
    })

    return () => unsubscribe()
  }, [])

  async function loginWithGoogle() {
    const { user: fbUser } = await signInWithGoogle()
    const res = await api.post('/api/v1/auth/firebase-login', {
      uid: fbUser.uid,
      email: fbUser.email,
      displayName: fbUser.displayName,
    })
    const result = res.data.data
    const nextUser = {
      merchantId: result.userId,
      tenantId: result.tenantId,
      username: result.username,
      displayName: result.displayName || fbUser.displayName,
      roles: result.roles,
      isGoogleUser: true,
      photoURL: fbUser.photoURL,
    }
    localStorage.setItem('tp_token', result.accessToken)
    localStorage.setItem('tp_admin_token', result.accessToken)
    localStorage.setItem('tp_user', JSON.stringify(nextUser))
    localStorage.setItem('tp_admin_user', JSON.stringify(nextUser))
    setUser(nextUser)
    return nextUser
  }

  async function loginDirectGoogleUser(email = 'rehankhan0214e@gmail.com', displayName = 'Rehan Khan') {
    const { user: fbUser } = await signInAsGoogleUser(email, displayName)
    const res = await api.post('/api/v1/auth/firebase-login', {
      uid: fbUser.uid,
      email: fbUser.email,
      displayName: fbUser.displayName,
    })
    const result = res.data.data
    const nextUser = {
      merchantId: result.userId,
      tenantId: result.tenantId,
      username: result.username,
      displayName: result.displayName || fbUser.displayName,
      roles: result.roles,
      isGoogleUser: true,
      photoURL: fbUser.photoURL,
    }
    localStorage.setItem('tp_token', result.accessToken)
    localStorage.setItem('tp_admin_token', result.accessToken)
    localStorage.setItem('tp_user', JSON.stringify(nextUser))
    localStorage.setItem('tp_admin_user', JSON.stringify(nextUser))
    setUser(nextUser)
    return nextUser
  }

  async function login(username, password) {
    const result = await loginRequest(username, password)
    const nextUser = {
      merchantId: result.userId,
      tenantId: result.tenantId,
      username: result.username,
      roles: result.roles,
      isGoogleUser: false,
    }
    localStorage.setItem('tp_token', result.accessToken)
    localStorage.setItem('tp_user', JSON.stringify(nextUser))
    if (result.roles.includes('ROLE_ADMIN')) {
      localStorage.setItem('tp_admin_token', result.accessToken)
      localStorage.setItem('tp_admin_user', JSON.stringify(nextUser))
    }
    setUser(nextUser)
    return nextUser
  }

  async function logout() {
    localStorage.removeItem('tp_token')
    localStorage.removeItem('tp_user')
    localStorage.removeItem('tp_admin_token')
    localStorage.removeItem('tp_admin_user')
    setUser(null)
    setFirebaseUser(null)
    try {
      await logOutFromFirebase()
    } catch (e) {
      console.warn('Firebase logout warning:', e)
    }
  }

  const isAdmin = Boolean(user?.roles?.includes('ROLE_ADMIN'))

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        ready,
        login,
        loginWithGoogle,
        loginDirectGoogleUser,
        logout,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
