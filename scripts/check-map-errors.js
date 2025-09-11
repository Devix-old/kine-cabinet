#!/usr/bin/env node

/**
 * Script pour vérifier les erreurs potentielles avec .map() sur des données non-tableaux
 */

import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

console.log('🔍 VÉRIFICATION DES ERREURS .map()')
console.log('=' .repeat(50))

const appDir = join(process.cwd(), 'src', 'app')

// Fonction pour lire récursivement les fichiers
function findPageFiles(dir, files = []) {
  const items = readdirSync(dir, { withFileTypes: true })
  
  for (const item of items) {
    const fullPath = join(dir, item.name)
    
    if (item.isDirectory()) {
      findPageFiles(fullPath, files)
    } else if (item.name === 'page.js') {
      files.push(fullPath)
    }
  }
  
  return files
}

// Trouver tous les fichiers page.js
const pageFiles = findPageFiles(appDir)

console.log(`\n📁 Fichiers trouvés: ${pageFiles.length}`)

let issuesFound = 0

pageFiles.forEach(filePath => {
  try {
    const content = readFileSync(filePath, 'utf8')
    const relativePath = filePath.replace(process.cwd(), '').replace(/\\/g, '/')
    
    // Chercher les utilisations de .map() sans protection
    const mapRegex = /(\w+)\.map\(/g
    let match
    
    while ((match = mapRegex.exec(content)) !== null) {
      const variableName = match[1]
      const lineNumber = content.substring(0, match.index).split('\n').length
      
      // Vérifier si la variable est protégée (avec || [])
      const beforeMap = content.substring(0, match.index)
      const isProtected = beforeMap.includes(`(${variableName} || [])`) || 
                         beforeMap.includes(`${variableName} || []`)
      
      if (!isProtected) {
        console.log(`⚠️  ${relativePath}:${lineNumber}`)
        console.log(`   Variable "${variableName}" utilisée avec .map() sans protection`)
        console.log(`   Suggestion: (${variableName} || []).map(...)`)
        issuesFound++
      }
    }
    
    // Chercher les appels API qui pourraient retourner des objets au lieu de tableaux
    const apiCalls = content.match(/get\('\/api\/\w+'\)/g) || []
    apiCalls.forEach(apiCall => {
      const lineNumber = content.indexOf(apiCall)
      const lineNum = content.substring(0, lineNumber).split('\n').length
      
      // Vérifier si le résultat est utilisé directement avec .map()
      const afterApiCall = content.substring(lineNumber + apiCall.length)
      if (afterApiCall.includes('.map(')) {
        console.log(`⚠️  ${relativePath}:${lineNum}`)
        console.log(`   API call ${apiCall} pourrait retourner un objet, pas un tableau`)
        console.log(`   Vérifiez la structure de retour de l'API`)
        issuesFound++
      }
    })
    
  } catch (error) {
    console.log(`⚠️  Erreur lecture ${filePath}: ${error.message}`)
  }
})

console.log('\n📊 RÉSUMÉ')
console.log('-'.repeat(40))

if (issuesFound === 0) {
  console.log('✅ Aucun problème détecté avec les utilisations de .map()')
} else {
  console.log(`⚠️  ${issuesFound} problème(s) potentiel(s) détecté(s)`)
  console.log('\n💡 Solutions recommandées:')
  console.log('   1. Utiliser (variable || []).map(...) pour protéger contre undefined/null')
  console.log('   2. Vérifier la structure de retour des APIs')
  console.log('   3. Initialiser les états avec des tableaux vides: useState([])')
}

console.log('\n🎯 VÉRIFICATION TERMINÉE')
