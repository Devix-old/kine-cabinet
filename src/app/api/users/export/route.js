import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/users/export - Export users data
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const status = searchParams.get('status') || 'all'

    // Construire les filtres
    const where = {
      ...(status !== 'all' && {
        isActive: status === 'active'
      })
    }

    // Récupérer tous les utilisateurs avec leurs statistiques
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            appointmentsCreated: true,
            appointmentsAssigned: true,
            treatmentsCreated: true,
            medicalRecordsCreated: true,
            notesCreated: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (format === 'csv') {
      // Générer le CSV
      const csvHeaders = [
        'ID',
        'Nom',
        'Email',
        'Rôle',
        'Statut',
        'Dernière connexion',
        'Date création',
        'RDV créés',
        'RDV assignés',
        'Traitements créés',
        'Dossiers créés',
        'Notes créées'
      ].join(',')

      const csvRows = users.map(user => [
        user.id,
        `"${user.name}"`,
        user.email,
        user.role,
        user.isActive ? 'Actif' : 'Inactif',
        user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : 'Jamais',
        new Date(user.createdAt).toLocaleDateString('fr-FR'),
        user._count.appointmentsCreated || 0,
        user._count.appointmentsAssigned || 0,
        user._count.treatmentsCreated || 0,
        user._count.medicalRecordsCreated || 0,
        user._count.notesCreated || 0
      ].join(','))

      const csvContent = [csvHeaders, ...csvRows].join('\n')
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="utilisateurs-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    // Format JSON par défaut
    return NextResponse.json({
      users,
      total: users.length,
      exportedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de l\'export des utilisateurs:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'export' },
      { status: 500 }
    )
  }
} 