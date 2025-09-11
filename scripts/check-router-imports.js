#!/usr/bin/env node

/**
 * Script pour vérifier que toutes les pages qui utilisent router ont bien importé useRouter
 */

import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

console.log('🔍 VÉRIFICATION DES IMPORTS useRouter')
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
    
    // Vérifier si le fichier utilise router
    const usesRouter = content.includes('router.')
    
    if (usesRouter) {
      // Vérifier si useRouter est importé
      const hasUseRouterImport = content.includes('import') && content.includes('useRouter')
      
      if (!hasUseRouterImport) {
        console.log(`❌ ${relativePath}`)
        console.log(`   Utilise router mais n'importe pas useRouter`)
        issuesFound++
      } else {
        console.log(`✅ ${relativePath}`)
      }
    }
  } catch (error) {
    console.log(`⚠️  Erreur lecture ${filePath}: ${error.message}`)
  }
})

console.log('\n📊 RÉSUMÉ')
console.log('-'.repeat(40))

if (issuesFound === 0) {
  console.log('✅ Tous les fichiers qui utilisent router ont bien importé useRouter')
} else {
  console.log(`❌ ${issuesFound} fichier(s) avec des problèmes d'import useRouter`)
  console.log('\n💡 Solutions:')
  console.log('   1. Ajouter: import { useRouter } from \'next/navigation\'')
  console.log('   2. Ajouter: const router = useRouter() dans le composant')
}

console.log('\n🎯 VÉRIFICATION TERMINÉE')
