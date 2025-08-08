// Test script pour vérifier la gestion des doublons
console.log('🧪 Test de gestion des doublons - Salles et Tarifs')

const testDuplicateHandling = async () => {
  const baseURL = 'http://localhost:3000/api'
  
  try {
    console.log('\n🏠 Test création salle avec doublon...')
    
    // Créer une première salle
    const room1 = {
      nom: 'Salle Test Unique',
      capacite: 2,
      equipement: 'Table, Chaise'
    }
    
    const createRoom1Response = await fetch(`${baseURL}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(room1)
    })
    
    if (createRoom1Response.ok) {
      console.log('✅ Première salle créée avec succès')
      
      // Essayer de créer une deuxième salle avec le même nom
      const room2 = {
        nom: 'Salle Test Unique', // Même nom
        capacite: 3,
        equipement: 'Table, Chaise, Électrothérapie'
      }
      
      const createRoom2Response = await fetch(`${baseURL}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(room2)
      })
      
      if (createRoom2Response.status === 409) {
        const errorData = await createRoom2Response.json()
        console.log('✅ Erreur de doublon détectée:', errorData.error)
      } else {
        console.log('❌ Erreur: Le doublon n\'a pas été détecté')
      }
    } else {
      console.log('❌ Erreur création première salle')
    }
    
    console.log('\n💰 Test création tarif avec doublon...')
    
    // Créer un premier tarif
    const tarif1 = {
      nom: 'Tarif Test Unique',
      montant: 50.00,
      duree: 45,
      description: 'Tarif de test unique'
    }
    
    const createTarif1Response = await fetch(`${baseURL}/tarifs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tarif1)
    })
    
    if (createTarif1Response.ok) {
      console.log('✅ Premier tarif créé avec succès')
      
      // Essayer de créer un deuxième tarif avec le même nom
      const tarif2 = {
        nom: 'Tarif Test Unique', // Même nom
        montant: 60.00,
        duree: 60,
        description: 'Tarif de test unique (doublon)'
      }
      
      const createTarif2Response = await fetch(`${baseURL}/tarifs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tarif2)
      })
      
      if (createTarif2Response.status === 409) {
        const errorData = await createTarif2Response.json()
        console.log('✅ Erreur de doublon détectée:', errorData.error)
      } else {
        console.log('❌ Erreur: Le doublon n\'a pas été détecté')
      }
    } else {
      console.log('❌ Erreur création premier tarif')
    }
    
    console.log('\n🎉 Tests de gestion des doublons terminés!')
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error)
  }
}

// Attendre que le serveur soit prêt
setTimeout(testDuplicateHandling, 2000) 