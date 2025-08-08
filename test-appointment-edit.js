// Test script pour vérifier la modification des rendez-vous
console.log('🧪 Test de modification des rendez-vous')

const testAppointmentEdit = async () => {
  const baseURL = 'http://localhost:3000/api'
  
  try {
    console.log('\n📅 Test modification rendez-vous...')
    
    // D'abord, récupérer un rendez-vous existant
    const appointmentsResponse = await fetch(`${baseURL}/appointments?startDate=2024-01-01&endDate=2024-12-31&limit=1`)
    
    if (appointmentsResponse.ok) {
      const appointmentsData = await appointmentsResponse.json()
      const appointments = appointmentsData.appointments || []
      
      if (appointments.length > 0) {
        const appointment = appointments[0]
        console.log('✅ Rendez-vous trouvé:', appointment.id)
        
        // Récupérer les données nécessaires pour la modification
        const [patientsResponse, kinesResponse, tarifsResponse, roomsResponse] = await Promise.all([
          fetch(`${baseURL}/patients?limit=1`),
          fetch(`${baseURL}/users?role=KINE&limit=1`),
          fetch(`${baseURL}/tarifs?limit=1`),
          fetch(`${baseURL}/rooms?limit=1`)
        ])
        
        const patients = await patientsResponse.json()
        const kines = await kinesResponse.json()
        const tarifs = await tarifsResponse.json()
        const rooms = await roomsResponse.json()
        
        // Préparer les données de modification
        const updateData = {
          date: new Date().toISOString(),
          time: '14:30',
          duree: 45,
          type: 'CONSULTATION',
          statut: 'CONFIRME',
          patientId: patients.patients?.[0]?.id || appointment.patientId,
          kineId: kines.users?.[0]?.id || appointment.kineId,
          tarifId: tarifs?.[0]?.id || appointment.tarifId,
          salleId: rooms?.[0]?.id || appointment.salleId,
          motif: 'Motif modifié pour test',
          notes: 'Notes modifiées pour test'
        }
        
        console.log('📝 Données de modification:', updateData)
        
        // Modifier le rendez-vous
        const updateResponse = await fetch(`${baseURL}/appointments/${appointment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        })
        
        if (updateResponse.ok) {
          const updatedAppointment = await updateResponse.json()
          console.log('✅ Rendez-vous modifié avec succès')
          console.log('📊 Nouvelles données:', {
            id: updatedAppointment.id,
            date: updatedAppointment.date,
            statut: updatedAppointment.statut,
            motif: updatedAppointment.motif,
            patient: updatedAppointment.patient?.nom,
            kine: updatedAppointment.kine?.name,
            tarif: updatedAppointment.tarif?.nom,
            salle: updatedAppointment.salle?.nom
          })
        } else {
          const errorData = await updateResponse.json()
          console.log('❌ Erreur modification rendez-vous:', errorData.error)
        }
      } else {
        console.log('⚠️ Aucun rendez-vous trouvé pour le test')
      }
    } else {
      console.log('❌ Erreur récupération rendez-vous')
    }
    
    console.log('\n🎉 Test de modification terminé!')
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  }
}

// Attendre que le serveur soit prêt
setTimeout(testAppointmentEdit, 2000) 