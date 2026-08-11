//useAuth.jsx
// import { useState, useEffect, useCallback, createContext, useContext } from 'react'
// import { supabase } from './supabase'

// const AuthContext = createContext(null)

// export function useAuth() {
//   const ctx = useContext(AuthContext)
//   if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
//   return ctx
// }

// export function AuthProvider(props) {
//   const { children } = props

//   const [session, setSession] = useState(null)
//   const [profile, setProfile] = useState(null)
//   const [members, setMembers] = useState([])
//   const [allProfiles, setAllProfiles] = useState([]) //new
//   const [loading, setLoading] = useState(true)

//   const fetchProfile = useCallback(async (userId) => {
//     if (!userId) {
//       setProfile(null)
//       return null
//     }

//     const { data, error } = await supabase
//       .from('profiles')
//       .select('id, email, it_name, role, status, created_at, updated_at')
//       .eq('id', userId)
//       .maybeSingle()

//     if (error) {
//       console.error('fetch profile error:', error)
//       setProfile(null)
//       return null
//     }

//     setProfile(data || null)
//     return data || null
//   }, [])

//   const fetchAllProfiles = useCallback(async () => {
//     const { data, error } = await supabase
//       .from('profiles')
//       .select('id, email, it_name, role, status, created_at, updated_at')
//       .order('it_name', { ascending: true, nullsFirst: false })
//       .order('email', { ascending: true })

//     if (error) {
//       console.error('fetch all profiles error:', error)
//       setAllProfiles([])
//       return []
//     }

//     setAllProfiles(data || [])
//     return data || []
//   }, [])

//   // const fetchMembers = useCallback(async () => {
//   //   const { data, error } = await supabase
//   //     .from('profiles')
//   //     .select('id, email, it_name, role, status')
//   //     .eq('status', 'active')
//   //     .order('it_name', { ascending: true, nullsFirst: false })
//   //     .order('email', { ascending: true })

//   //   if (error) {
//   //     console.error('fetch members error:', error)
//   //     setMembers([])
//   //     return []
//   //   }

//   //   setMembers(data || [])
//   //   return data || []
//   // }, [])

//   // const fetchMembers = useCallback(async () => {
//   //   const { data, error } = await supabase
//   //     .from('profiles')
//   //     .select('id, email, it_name, role, status')
//   //     .eq('role', 'it_user')
//   //     .eq('status', 'active')
//   //     .order('it_name', { ascending: true, nullsFirst: false })
//   //     .order('email', { ascending: true })

//   //   if (error) {
//   //     console.error('fetch members error:', error)
//   //     setMembers([])
//   //     return []
//   //   }

//   //   setMembers(data || [])
//   //   return data || []
//   // }, [])

//   const fetchMembers = useCallback(async () => {
//     const { data, error } = await supabase
//       .from('profiles')
//       .select('id, email, it_name, role, status')
//       .order('it_name', { ascending: true, nullsFirst: false })
//       .order('email', { ascending: true })

//     if (error) {
//       console.error('fetch members error:', error)
//       setMembers([])
//       setAllProfiles([])
//       return []
//     }

//     const profiles = data || []

//     setAllProfiles(profiles)

//     const active = profiles.filter(
//       member => member.status === 'active'
//     )

//     setMembers(active)

//     return active
//   }, [])

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session)
//       Promise.all([
//         fetchProfile(session?.user?.id),
//         fetchMembers(),
//       ]).finally(() => setLoading(false))
//     })

//     const { data: { subscription } } = supabase.auth.onAuthStateChange(
//       async (_event, session) => {
//         setSession(session)
//         await Promise.all([
//           fetchProfile(session?.user?.id),
//           fetchMembers(),
//         ])
//         setLoading(false)
//       }
//     )

//     return () => subscription.unsubscribe()
//   }, [fetchMembers, fetchProfile])

//   const signIn = useCallback(async (email, password) => {
//     const { error } = await supabase.auth.signInWithPassword({ email, password })
//     if (error) return { success: false, error: error.message }
//     return { success: true }
//   }, [])

//   const signOut = useCallback(async () => {
//     await supabase.auth.signOut()
//     setProfile(null)
//     setMembers([])
//   }, [])

//   const refreshProfile = useCallback(async () => {
//     return fetchProfile(session?.user?.id)
//   }, [fetchProfile, session?.user?.id])

//   // const refreshMembers = useCallback(async () => {
//   //   return fetchMembers()
//   // }, [fetchMembers])

//   const refreshMembers = useCallback(async () => {
//     await Promise.all([
//       fetchAllProfiles(),
//       fetchMembers(),
//     ])

//     return true
//   }, [fetchAllProfiles, fetchMembers])

//   const role = profile?.role || 'it_user'
//   const status = profile?.status || 'active'
//   const isDisabled = status !== 'active'
//   const isSuperAdmin = role === 'super_admin' && !isDisabled
//   const isITUser = role === 'it_user' && !isDisabled

//   const value = {
//     session,
//     profile,
//     // All profiles, including inactive
//     allProfiles,
//   // Active profiles only
//     members,
//     activeMembers: members,
//     loading,
//     role,
//     status,
//     isSuperAdmin,
//     isITUser,
//     isDisabled,
//     refreshProfile,
//     refreshMembers,
//     signIn,
//     signOut,
//     currentEmail: session?.user?.email || '',
//     displayName: profile?.it_name || session?.user?.email?.split('@')[0] || 'User',
//   }

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   )
// }


// useAuth.jsx

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return ctx
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)

  // All profiles:
  // - active IT users
  // - inactive IT users
  // - super admins
  const [allProfiles, setAllProfiles] = useState([])

  // Active IT users only
  const [members, setMembers] = useState([])

  const [loading, setLoading] = useState(true)

  // ─────────────────────────────────────────────────────────────────────────────
  // Current user's profile
  // ─────────────────────────────────────────────────────────────────────────────

  const fetchProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null)
      return null
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, it_name, role, status, created_at, updated_at')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('fetch profile error:', error)
      setProfile(null)
      return null
    }

    setProfile(data || null)

    return data || null
  }, [])

  // ─────────────────────────────────────────────────────────────────────────────
  // All profiles
  // ─────────────────────────────────────────────────────────────────────────────

  const fetchAllProfiles = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, it_name, role, status, created_at, updated_at')
      .order('it_name', { ascending: true, nullsFirst: false })
      .order('email', { ascending: true })

    if (error) {
      console.error('fetch all profiles error:', error)
      setAllProfiles([])
      setMembers([])
      return []
    }

    const profiles = data || []

    setAllProfiles(profiles)

    // Only active IT users are available for task assignment
    const activeITMembers = profiles.filter(
      member =>
        member.role === 'it_user' &&
        member.status === 'active'
    )

    setMembers(activeITMembers)

    return profiles
  }, [])

  // ─────────────────────────────────────────────────────────────────────────────
  // Initial authentication / session loading
  // ─────────────────────────────────────────────────────────────────────────────

  // useEffect(() => {
  //   let mounted = true

  //   async function initializeAuth() {
  //     try {
  //       const {
  //         data: { session },
  //         error,
  //       } = await supabase.auth.getSession()

  //       if (error) {
  //         console.error('getSession error:', error)
  //       }

  //       if (!mounted) return

  //       setSession(session)

  //       await Promise.all([
  //         fetchProfile(session?.user?.id),
  //         fetchAllProfiles(),
  //       ])
  //     } catch (error) {
  //       console.error('Auth initialization error:', error)

  //       if (mounted) {
  //         setSession(null)
  //         setProfile(null)
  //         setAllProfiles([])
  //         setMembers([])
  //       }
  //     } finally {
  //       if (mounted) {
  //         setLoading(false)
  //       }
  //     }
  //   }

  //   initializeAuth()

  //   // Listen for login/logout/token refresh
  //   const {
  //     data: { subscription },
  //   } = supabase.auth.onAuthStateChange((event, session) => {
  //     if (!mounted) return

  //     setSession(session)

  //     if (event === 'SIGNED_OUT') {
  //       setProfile(null)
  //       setAllProfiles([])
  //       setMembers([])
  //       return
  //     }

  //     if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
  //       // Do not block the Supabase auth callback
  //       setTimeout(async () => {
  //         if (!mounted) return

  //         await Promise.all([
  //           fetchProfile(session?.user?.id),
  //           fetchAllProfiles(),
  //         ])
  //       }, 0)
  //     }
  //   })

  //   return () => {
  //     mounted = false
  //     subscription.unsubscribe()
  //   }
  // }, [fetchProfile, fetchAllProfiles])

useEffect(() => {
  let mounted = true

  async function initializeAuth() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error('getSession error:', error)
      }

      if (!mounted) return

      // No logged-in user
      if (!session?.user?.id) {
        setSession(null)
        setProfile(null)
        setAllProfiles([])
        setMembers([])
        return
      }

      // Check the user's profile/status
      const userProfile = await fetchProfile(session.user.id)

      if (!mounted) return

      // Inactive or missing profile
      if (!userProfile || userProfile.status !== 'active') {
        await supabase.auth.signOut()

        if (mounted) {
          setSession(null)
          setProfile(null)
          setAllProfiles([])
          setMembers([])
        }

        return
      }

      // Valid active user
      setSession(session)

      await fetchAllProfiles()

    } catch (error) {
      console.error('Auth initialization error:', error)

      if (mounted) {
        setSession(null)
        setProfile(null)
        setAllProfiles([])
        setMembers([])
      }
    } finally {
      if (mounted) {
        setLoading(false)
      }
    }
  }

  initializeAuth()

  // IMPORTANT:
  // Do not perform Supabase queries directly inside
  // the onAuthStateChange callback.
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    if (!mounted) return

    // SIGNED_OUT can be handled immediately
    if (event === 'SIGNED_OUT' || !session?.user?.id) {
      setSession(null)
      setProfile(null)
      setAllProfiles([])
      setMembers([])
      setLoading(false)
      return
    }

    // Defer Supabase queries outside the auth callback.
    setTimeout(async () => {
      if (!mounted) return

      try {
        const userProfile = await fetchProfile(session.user.id)

        if (!mounted) return

        if (!userProfile || userProfile.status !== 'active') {
          await supabase.auth.signOut()

          if (!mounted) return

          setSession(null)
          setProfile(null)
          setAllProfiles([])
          setMembers([])
          setLoading(false)

          return
        }

        setSession(session)

        await fetchAllProfiles()

        if (mounted) {
          setLoading(false)
        }

      } catch (error) {
        console.error('Auth state change error:', error)

        if (mounted) {
          setSession(null)
          setProfile(null)
          setAllProfiles([])
          setMembers([])
          setLoading(false)
        }
      }
    }, 0)
  })

  return () => {
    mounted = false
    subscription.unsubscribe()
  }
}, [fetchProfile, fetchAllProfiles])

// useEffect(() => {
//   let mounted = true

//   async function initializeAuth() {
//     try {
//       const {
//         data: { session },
//         error,
//       } = await supabase.auth.getSession()

//       if (error) {
//         console.error('getSession error:', error)
//       }

//       if (!mounted) return

//       if (!session?.user?.id) {
//         setSession(null)
//         setProfile(null)
//         await fetchAllProfiles()
//         return
//       }

//       const userProfile = await fetchProfile(session.user.id)

//       if (!userProfile || userProfile.status !== 'active') {
//         await supabase.auth.signOut()

//         if (mounted) {
//           setSession(null)
//           setProfile(null)
//           setAllProfiles([])
//           setMembers([])
//         }

//         return
//       }

//       if (mounted) {
//         setSession(session)
//         await fetchAllProfiles()
//       }
//     } catch (error) {
//       console.error('Auth initialization error:', error)

//       if (mounted) {
//         setSession(null)
//         setProfile(null)
//         setAllProfiles([])
//         setMembers([])
//       }
//     } finally {
//       if (mounted) {
//         setLoading(false)
//       }
//     }
//   }

//   initializeAuth()

//   const {
//     data: { subscription },
//   } = supabase.auth.onAuthStateChange(
//     async (_event, session) => {
//       if (!mounted) return

//       if (!session?.user?.id) {
//         setSession(null)
//         setProfile(null)
//         setAllProfiles([])
//         setMembers([])
//         setLoading(false)
//         return
//       }

//       const userProfile = await fetchProfile(session.user.id)

//       if (!userProfile || userProfile.status !== 'active') {
//         await supabase.auth.signOut()

//         if (mounted) {
//           setSession(null)
//           setProfile(null)
//           setAllProfiles([])
//           setMembers([])
//           setLoading(false)
//         }

//         return
//       }

//       if (mounted) {
//         setSession(session)
//         await fetchAllProfiles()
//         setLoading(false)
//       }
//     }
//   )

//   return () => {
//     mounted = false
//     subscription.unsubscribe()
//   }
// }, [fetchProfile, fetchAllProfiles])

// ─────────────────────────────────────────────────────────────────────────────
// Periodically verify current user's account status
// ─────────────────────────────────────────────────────────────────────────────

useEffect(() => {
  if (!session?.user?.id) return

  const checkAccountStatus = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('status')
      .eq('id', session.user.id)
      .maybeSingle()

    if (error) {
      console.error('Account status check error:', error)
      return
    }

    if (!data || data.status !== 'active') {
      await supabase.auth.signOut()
      setSession(null)
      setProfile(null)
      setAllProfiles([])
      setMembers([])

      alert('Your account has been deactivated. Please contact the administrator.')
    }
  }

  // Check every 30 seconds
  const interval = setInterval(checkAccountStatus, 30000)

  return () => clearInterval(interval)
}, [session?.user?.id])

  // ─────────────────────────────────────────────────────────────────────────────
  // Authentication
  // ─────────────────────────────────────────────────────────────────────────────

  // const signIn = useCallback(async (email, password) => {
  //   const { error } = await supabase.auth.signInWithPassword({
  //     email,
  //     password,
  //   })

  //   if (error) {
  //     return {
  //       success: false,
  //       error: error.message,
  //     }
  //   }

  //   return {
  //     success: true,
  //   }
  // }, [])

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    const userId = data?.user?.id

    if (!userId) {
      await supabase.auth.signOut()
      return { success: false, error: 'Unable to identify user profile.' }
    }

    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, it_name, role, status')
      .eq('id', userId)
      .maybeSingle()

    if (profileError) {
      await supabase.auth.signOut()
      return { success: false, error: 'Unable to verify user access.' }
    }

    if (!userProfile || userProfile.status !== 'active') {
      await supabase.auth.signOut()

      return {
        success: false,
        error: 'Your account is inactive. Please contact the administrator.',
      }
    }

    return { success: true }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()

    setSession(null)
    setProfile(null)
    setAllProfiles([])
    setMembers([])
  }, [])

  // ─────────────────────────────────────────────────────────────────────────────
  // Refresh helpers
  // ─────────────────────────────────────────────────────────────────────────────

  const refreshProfile = useCallback(async () => {
    return fetchProfile(session?.user?.id)
  }, [fetchProfile, session?.user?.id])

  const refreshMembers = useCallback(async () => {
    return fetchAllProfiles()
  }, [fetchAllProfiles])

  // ─────────────────────────────────────────────────────────────────────────────
  // Role / status
  // ─────────────────────────────────────────────────────────────────────────────

  const role = profile?.role || 'it_user'
  const status = profile?.status || 'active'

  const isDisabled = status !== 'active'

  const isSuperAdmin =
    role === 'super_admin' &&
    !isDisabled

  const isITUser =
    role === 'it_user' &&
    !isDisabled

  // ─────────────────────────────────────────────────────────────────────────────
  // Context
  // ─────────────────────────────────────────────────────────────────────────────

  const value = {
    session,
    profile,

    // Every profile from DB
    allProfiles,

    // Active IT users only
    members,
    activeMembers: members,

    loading,

    role,
    status,
    isSuperAdmin,
    isITUser,
    isDisabled,

    refreshProfile,
    refreshMembers,

    signIn,
    signOut,

    currentEmail: session?.user?.email || '',

    displayName:
      profile?.it_name ||
      session?.user?.email?.split('@')[0] ||
      'User',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}