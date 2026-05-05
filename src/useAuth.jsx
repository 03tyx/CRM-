// // useAuth.jsx
// import { useState, useEffect, useCallback, createContext, useContext } from 'react'
// import { supabase } from './supabase'

// const AuthContext = createContext(null)

// export function useAuth() {
//   const ctx = useContext(AuthContext)
//   if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
//   return ctx
// }

// export function AuthProvider({ children }) {
//   const [session,          setSession]          = useState(undefined)
//   const [profile,          setProfile]          = useState(null)
//   const [loading,          setLoading]          = useState(true)
//   const [needsPasswordSet, setNeedsPasswordSet] = useState(false)

//   const fetchProfile = useCallback(async (userId) => {
//     if (!userId) { setProfile(null); return }
//     const { data } = await supabase
//       .from('profiles')
//       .select('*')
//       .eq('id', userId)
//       .single()
//     setProfile(data || null)
//   }, [])

//   useEffect(() => {
//     // getSession also exchanges the invite token from the URL automatically
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session)
//       fetchProfile(session?.user?.id).finally(() => setLoading(false))
//     })

//     const { data: { subscription } } = supabase.auth.onAuthStateChange(
//       async (event, session) => {
//         setSession(session)

//         // Fired when user clicks invite link or password reset link
//         if (event === 'PASSWORD_RECOVERY') {
//           setNeedsPasswordSet(true)
//           setLoading(false)
//           return
//         }

//         // Fired on first sign-in via invite link (before they set a password)
//         if (event === 'SIGNED_IN' && session?.user) {
//           const isFirstSignIn = !session.user.last_sign_in_at ||
//             session.user.last_sign_in_at === session.user.created_at
//           if (isFirstSignIn && session.user.invited_at) {
//             setNeedsPasswordSet(true)
//             setLoading(false)
//             return
//           }
//         }

//         // Fired after supabase.auth.updateUser({ password }) succeeds
//         if (event === 'USER_UPDATED') {
//           setNeedsPasswordSet(false)
//         }

//         await fetchProfile(session?.user?.id)
//         setLoading(false)
//       }
//     )

//     return () => subscription.unsubscribe()
//   }, [fetchProfile])

//   const signIn = useCallback(async (email, password) => {
//     const { error } = await supabase.auth.signInWithPassword({ email, password })
//     if (error) return { success: false, error: error.message }
//     return { success: true }
//   }, [])

//   const signOut = useCallback(async () => {
//     await supabase.auth.signOut()
//     setProfile(null)
//     setNeedsPasswordSet(false)
//   }, [])

//   const clearNeedsPasswordSet = useCallback(() => setNeedsPasswordSet(false), [])

//   const isSuperAdmin  = profile?.role === 'super_admin'
//   const canEditMember = useCallback((itName) => {
//     if (!profile) return false
//     if (isSuperAdmin) return true
//     return profile.it_name === itName
//   }, [profile, isSuperAdmin])

//   return (
//     <AuthContext.Provider value={{
//       session,
//       profile,
//       loading,
//       needsPasswordSet,
//       clearNeedsPasswordSet,
//       isSuperAdmin,
//       isITUser: profile?.role === 'it_user',
//       canEditMember,
//       signIn,
//       signOut,
//       currentEmail:  session?.user?.email  || '',
//       currentItName: profile?.it_name      || '',
//       displayName:   profile?.it_name || session?.user?.email?.split('@')[0] || 'User',
//     }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }