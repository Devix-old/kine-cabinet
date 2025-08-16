'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function CabinetNameStep() {
	const [name, setName] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const router = useRouter()

	const handleSubmit = async (e) => {
		e.preventDefault()
		setError('')
		if (!name.trim()) return
		setLoading(true)
		try {
			const resp = await fetch('/api/cabinet/update-name', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: name.trim() })
			})
			const data = await resp.json()
			if (!resp.ok) {
				throw new Error(data?.error || "Impossible d'enregistrer le nom du cabinet")
			}
			// mark onboarding complete
			await fetch('/api/cabinet/complete-onboarding', { method: 'PUT' })
			// set cookie so middleware permits access immediately
			document.cookie = 'onboardingCompleted=true; path=/'
			router.push('/dashboard?onboarding=completed')
		} catch (err) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
			<div className="w-full max-w-xl bg-white rounded-xl shadow-md p-6 sm:p-8">
				<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Nom du cabinet</h1>
				<p className="text-gray-600 mb-6">Saisissez le nom de votre cabinet. Vous pourrez le modifier plus tard dans les paramètres.</p>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label htmlFor="cabinetName" className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
						<input
							id="cabinetName"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Mon Cabinet Santé"
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							required
							minLength={2}
							maxLength={80}
						/>
					</div>
					{error && (
						<p className="text-sm text-red-600">{error}</p>
					)}
					<button
						type="submit"
						disabled={loading || !name.trim()}
						className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
					>
						{loading ? (
							<>
								<Loader2 className="h-5 w-5 animate-spin mr-2" />
								Enregistrement...
							</>
						) : (
							<>Terminer</>
						)}
					</button>
				</form>
			</div>
		</div>
	)
}


