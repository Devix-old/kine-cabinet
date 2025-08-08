import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Middleware pour isoler les données par cabinet
export function withCabinetIsolation(handler) {
  return async (request, context) => {
    try {
      const session = await getServerSession(authOptions)
      
      if (!session) {
        return new Response(JSON.stringify({ error: 'Non authentifié' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Le super admin peut accéder à tout
      if (session.user.role === 'SUPER_ADMIN') {
        return handler(request, context, { session, cabinetId: null })
      }

      // Les autres utilisateurs doivent avoir un cabinetId
      if (!session.user.cabinetId) {
        return new Response(JSON.stringify({ error: 'Cabinet non assigné' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Passer le cabinetId au handler
      return handler(request, context, { 
        session, 
        cabinetId: session.user.cabinetId 
      })

    } catch (error) {
      console.error('Erreur middleware cabinet isolation:', error)
      return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}

// Fonction utilitaire pour filtrer les requêtes par cabinet
export function filterByCabinet(query, cabinetId) {
  if (!cabinetId) return query // Super admin peut voir tout
  
  return {
    ...query,
    where: {
      ...query.where,
      cabinetId: cabinetId
    }
  }
}

// Fonction utilitaire pour ajouter cabinetId aux données
export function addCabinetId(data, cabinetId) {
  if (!cabinetId) return data // Super admin n'a pas besoin de cabinetId
  
  return {
    ...data,
    cabinetId: cabinetId
  }
} 