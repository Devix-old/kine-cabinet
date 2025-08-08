// Test script pour vérifier les fonctionnalités d'édition
console.log('🧪 Test des fonctionnalités d\'édition - Utilisateurs, Salles, Tarifs')

const testEditFunctionality = async () => {
  const baseURL = 'http://localhost:3000/api'
  
  try {
    console.log('\n👤 Test édition utilisateur...')
    
    // Créer un utilisateur de test
    const testUser = {
      name: 'Test User Edit',
      email: 'test.edit@example.com',
      role: 'SECRETAIRE',
      password: 'password123',
      isActive: true
    }
    
    const createUserResponse = await fetch(`${baseURL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    })
    
    if (createUserResponse.ok) {
      const createdUser = await createUserResponse.json()
      console.log('✅ Utilisateur créé:', createdUser.name)
      
      // Modifier l'utilisateur
      const updatedUserData = {
        name: 'Test User Modified',
        email: 'test.modified@example.com',
        role: 'KINE',
        isActive: true
      }
      
      const updateUserResponse = await fetch(`${baseURL}/users/${createdUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUserData)
      })
      
      if (updateUserResponse.ok) {
        const updatedUser = await updateUserResponse.json()
        console.log('✅ Utilisateur modifié:', updatedUser.name, '->', updatedUserData.name)
      } else {
        console.log('❌ Erreur modification utilisateur')
      }
    } else {
      console.log('❌ Erreur création utilisateur')
    }
    
    console.log('\n🏠 Test édition salle...')
    
    // Créer une salle de test
    const testRoom = {
      nom: 'Salle Test Edit',
      capacite: 2,
      equipement: 'Table, Chaise'
    }
    
    const createRoomResponse = await fetch(`${baseURL}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testRoom)
    })
    
    if (createRoomResponse.ok) {
      const createdRoom = await createRoomResponse.json()
      console.log('✅ Salle créée:', createdRoom.nom)
      
      // Modifier la salle
      const updatedRoomData = {
        nom: 'Salle Test Modifiée',
        capacite: 3,
        equipement: 'Table, Chaise, Électrothérapie'
      }
      
      const updateRoomResponse = await fetch(`${baseURL}/rooms/${createdRoom.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRoomData)
      })
      
      if (updateRoomResponse.ok) {
        const updatedRoom = await updateRoomResponse.json()
        console.log('✅ Salle modifiée:', updatedRoom.nom, '->', updatedRoomData.nom)
      } else {
        console.log('❌ Erreur modification salle')
      }
    } else {
      console.log('❌ Erreur création salle')
    }
    
    console.log('\n💰 Test édition tarif...')
    
    // Créer un tarif de test
    const testTarif = {
      nom: 'Tarif Test Edit',
      montant: 50.00,
      duree: 45,
      description: 'Tarif de test pour édition'
    }
    
    const createTarifResponse = await fetch(`${baseURL}/tarifs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testTarif)
    })
    
    if (createTarifResponse.ok) {
      const createdTarif = await createTarifResponse.json()
      console.log('✅ Tarif créé:', createdTarif.nom)
      
      // Modifier le tarif
      const updatedTarifData = {
        nom: 'Tarif Test Modifié',
        montant: 60.00,
        duree: 60,
        description: 'Tarif de test modifié'
      }
      
      const updateTarifResponse = await fetch(`${baseURL}/tarifs/${createdTarif.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTarifData)
      })
      
      if (updateTarifResponse.ok) {
        const updatedTarif = await updateTarifResponse.json()
        console.log('✅ Tarif modifié:', updatedTarif.nom, '->', updatedTarifData.nom)
      } else {
        console.log('❌ Erreur modification tarif')
      }
    } else {
      console.log('❌ Erreur création tarif')
    }
    
    console.log('\n🎉 Tests d\'édition terminés!')
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error)
  }
}

// Attendre que le serveur soit prêt
setTimeout(testEditFunctionality, 2000) 