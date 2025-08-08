const testAPIs = async () => {
  const baseURL = 'http://localhost:3000/api'
  
  console.log('🧪 Test des APIs...')
  
  try {
    // Test GET tarifs
    console.log('\n📋 Test GET /api/tarifs')
    const tarifsResponse = await fetch(`${baseURL}/tarifs`)
    const tarifs = await tarifsResponse.json()
    console.log('✅ Tarifs récupérés:', tarifs.length, 'tarifs')
    
    // Test GET rooms
    console.log('\n🏠 Test GET /api/rooms')
    const roomsResponse = await fetch(`${baseURL}/rooms`)
    const rooms = await roomsResponse.json()
    console.log('✅ Salles récupérées:', rooms.length, 'salles')
    
    // Test POST tarif
    console.log('\n➕ Test POST /api/tarifs')
    const newTarif = {
      nom: 'Test Tarif',
      montant: 50.00,
      duree: 45,
      description: 'Tarif de test'
    }
    
    const createTarifResponse = await fetch(`${baseURL}/tarifs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTarif)
    })
    
    if (createTarifResponse.ok) {
      const createdTarif = await createTarifResponse.json()
      console.log('✅ Tarif créé:', createdTarif.nom)
      
      // Test DELETE tarif
      console.log('\n🗑️ Test DELETE /api/tarifs')
      const deleteTarifResponse = await fetch(`${baseURL}/tarifs/${createdTarif.id}`, {
        method: 'DELETE'
      })
      
      if (deleteTarifResponse.ok) {
        console.log('✅ Tarif supprimé')
      } else {
        console.log('❌ Erreur suppression tarif')
      }
    } else {
      console.log('❌ Erreur création tarif')
    }
    
    // Test POST room
    console.log('\n➕ Test POST /api/rooms')
    const newRoom = {
      nom: 'Salle Test',
      capacite: 2,
      equipement: 'Table, Chaise'
    }
    
    const createRoomResponse = await fetch(`${baseURL}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRoom)
    })
    
    if (createRoomResponse.ok) {
      const createdRoom = await createRoomResponse.json()
      console.log('✅ Salle créée:', createdRoom.nom)
      
      // Test DELETE room
      console.log('\n🗑️ Test DELETE /api/rooms')
      const deleteRoomResponse = await fetch(`${baseURL}/rooms/${createdRoom.id}`, {
        method: 'DELETE'
      })
      
      if (deleteRoomResponse.ok) {
        console.log('✅ Salle supprimée')
      } else {
        console.log('❌ Erreur suppression salle')
      }
    } else {
      console.log('❌ Erreur création salle')
    }
    
    console.log('\n🎉 Tests terminés!')
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error)
  }
}

// Attendre que le serveur soit prêt
setTimeout(testAPIs, 3000) 