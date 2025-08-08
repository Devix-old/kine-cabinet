// Test script pour vérifier le fonctionnement des paramètres
console.log('🧪 Test des paramètres - Création et affichage')

// Simuler la création d'un tarif
const testTarifCreation = async () => {
  try {
    console.log('\n📋 Test création tarif...')
    
    const newTarif = {
      nom: 'Test Tarif ' + Date.now(),
      montant: 55.00,
      duree: 45,
      description: 'Tarif de test automatique'
    }
    
    const response = await fetch('/api/tarifs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTarif)
    })
    
    if (response.ok) {
      const createdTarif = await response.json()
      console.log('✅ Tarif créé:', createdTarif.nom)
      
      // Vérifier que le tarif apparaît dans la liste
      const listResponse = await fetch('/api/tarifs?_t=' + Date.now())
      const tarifs = await listResponse.json()
      
      const foundTarif = tarifs.find(t => t.id === createdTarif.id)
      if (foundTarif) {
        console.log('✅ Tarif trouvé dans la liste:', foundTarif.nom)
      } else {
        console.log('❌ Tarif non trouvé dans la liste')
      }
      
      return createdTarif
    } else {
      console.log('❌ Erreur création tarif')
      return null
    }
  } catch (error) {
    console.error('❌ Erreur:', error)
    return null
  }
}

// Simuler la création d'une salle
const testRoomCreation = async () => {
  try {
    console.log('\n🏠 Test création salle...')
    
    const newRoom = {
      nom: 'Salle Test ' + Date.now(),
      capacite: 3,
      equipement: 'Table, Chaise, Électrothérapie'
    }
    
    const response = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRoom)
    })
    
    if (response.ok) {
      const createdRoom = await response.json()
      console.log('✅ Salle créée:', createdRoom.nom)
      
      // Vérifier que la salle apparaît dans la liste
      const listResponse = await fetch('/api/rooms?_t=' + Date.now())
      const rooms = await listResponse.json()
      
      const foundRoom = rooms.find(r => r.id === createdRoom.id)
      if (foundRoom) {
        console.log('✅ Salle trouvée dans la liste:', foundRoom.nom)
      } else {
        console.log('❌ Salle non trouvée dans la liste')
      }
      
      return createdRoom
    } else {
      console.log('❌ Erreur création salle')
      return null
    }
  } catch (error) {
    console.error('❌ Erreur:', error)
    return null
  }
}

// Exécuter les tests
const runTests = async () => {
  console.log('🚀 Démarrage des tests...')
  
  const tarif = await testTarifCreation()
  const room = await testRoomCreation()
  
  console.log('\n🎉 Tests terminés!')
  console.log('Résultats:')
  console.log('- Tarif créé:', tarif ? '✅' : '❌')
  console.log('- Salle créée:', room ? '✅' : '❌')
}

// Attendre que le serveur soit prêt
setTimeout(runTests, 2000) 