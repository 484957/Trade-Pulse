import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, signInWithGoogle, signInAsGoogleUser, logOutFromFirebase } from '../lib/firebase'
import { loginRequest } from '../lib/adminAuth'
import adminApi from '../lib/adminApi'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const res = await adminApi.post('/api/v1/auth/firebase-login', {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
          })
          if (res.data?.success) {
            const result = res.data.data
            if (result.roles?.includes('ROLE_ADMIN')) {
              const nextUser = {
                merchantId: result.userId,
                tenantId: result.tenantId,
                username: result.username,
                displayName: result.displayName,
                roles: result.roles,
              }
              localStorage.setItem('tpa_token', result.accessToken)
              localStorage.setItem('tpa_user', JSON.stringify(nextUser))
              setUser(nextUser)
            }
          }
        } catch (err) {
          console.warn('Admin Firebase auth sync error:', err?.message || err)
        }
      } else {
        const stored = localStorage.getItem('tpa_user')
        const token = localStorage.getItem('tpa_token')
        if (stored && token) {
          try {
            setUser(JSON.parse(stored))
          } catch {
            localStorage.removeItem('tpa_user')
            localStorage.removeItem('tpa_token')
          }
        }
      }
      setReady(true)
    })

    return () => unsubscribe()
  }, [])

  async function loginWithGoogle() {
    const { user: fbUser } = await signInWithGoogle()
    const res = await adminApi.post('/api/v1/auth/firebase-login', {
      uid: fbUser.uid,
      email: fbUser.email,
      displayName: fbUser.displayName,
    })
    const result = res.data.data
    if (!result.roles?.includes('ROLE_ADMIN')) {
      throw new Error(`Account ${fbUser.email} is not authorized for Admin Console. Use rehankhan0214e@gmail.com or ops@tradepulse.io.`)
    }
    const nextUser = {
      merchantId: result.userId,
      tenantId: result.tenantId,
      username: result.username,
      displayName: result.displayName,
      roles: result.roles,
    }
    localStorage.setItem('tpa_token', result.accessToken)
    localStorage.setItem('tpa_user', JSON.stringify(nextUser))
    setUser(nextUser)
    return nextUser
  }

  async function loginDirectGoogleUser(email = 'rehankhan0214e@gmail.com', displayName = 'Rehan Khan') {
    const { user: fbUser } = await signInAsGoogleUser(email, displayName)
    const res = await adminApi.post('/api/v1/auth/firebase-login', {
      uid: fbUser.uid,
      email: fbUser.email,
      displayName: fbUser.displayName,
    })
    const result = res.data.data
    if (!result.roles?.includes('ROLE_ADMIN')) {
      throw new Error(`Account ${email} is not authorized for Admin Console. Use rehankhan0214e@gmail.com or ops@tradepulse.io.`)
    }
    const nextUser = {
      merchantId: result.userId,
      tenantId: result.tenantId,
      username: result.username,
      displayName: result.displayName,
      roles: result.roles,
    }
    localStorage.setItem('tpa_token', result.accessToken)
    localStorage.setItem('tpa_user', JSON.stringify(nextUser))
    setUser(nextUser)
    return nextUser
  }

  async function login(username, password) {
    const result = await loginRequest(username, password)

    if (!result.roles || !result.roles.includes('ROLE_ADMIN')) {
      throw new Error('This account does not have admin access to the console.')
    }

    const nextUser = {
      merchantId: result.userId,
      tenantId: result.tenantId,
      username: result.username,
      roles: result.roles,
    }
    localStorage.setItem('tpa_token', result.accessToken)
    localStorage.setItem('tpa_user', JSON.stringify(nextUser))
    setUser(nextUser)
    return nextUser
  }

  async function logout() {
    localStorage.removeItem('tpa_token')
    localStorage.removeItem('tpa_user')
    setUser(null)
    try {
      await logOutFromFirebase()
    } catch (e) {
      console.warn('Firebase logout warning:', e)
    }
  }

  return (
    <AdminAuthContext.Provider value={{ user, ready, login, loginWithGoogle, loginDirectGoogleUser, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider')
  return ctx
}
