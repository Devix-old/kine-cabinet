'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
    CheckCircle2, ChevronLeft, ChevronRight, Loader2, Home, TextCursorInput, 
    Box, Tag, Clock, Users, Bell, Trash2, PlusCircle 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Enhanced step definitions with icons and descriptions
const stepsDefinition = [
    { key: 'type', title: 'Type de cabinet', description: 'Adaptez l\'interface à votre spécialité.', required: true, icon: Home },
    { key: 'name', title: 'Nom du cabinet', description: 'Choisissez un nom clair et professionnel.', required: true, icon: TextCursorInput },
    { key: 'rooms', title: 'Salles', description: 'Gérez vos espaces de consultation.', required: false, icon: Box },
    { key: 'services', title: 'Services', description: 'Sélectionnez vos services principaux.', required: false, icon: Tag },
    { key: 'tarifs', title: 'Tarifs', description: 'Définissez les prix par service.', required: false, icon: Tag },
    { key: 'hours', title: 'Horaires', description: 'Définissez vos heures d\'ouverture.', required: false, icon: Clock },
    { key: 'users', title: 'Équipe', description: 'Invitez vos collaborateurs.', required: false, icon: Users },
    { key: 'notifications', title: 'Notifications', description: 'Configurez les rappels et alertes.', required: false, icon: Bell },
]

// Registry of module configurations (extensible)
const MODULES = {
    KINESITHERAPIE: {
        key: 'KINESITHERAPIE',
        label: 'Kinésithérapie',
        namePlaceholder: 'Cabinet Santé Plus',
        roomPlaceholder: "Ex: Salle de rééducation",
        roomSuggestions: [
            "Salle de rééducation",
            "Salle d'électrothérapie",
            "Salle de massage"
        ],
        servicesRecommended: [
            'Consultation',
            'Bilan initial',
            'Séance de rééducation'
        ]
    },
    DENTAIRE: {
        key: 'DENTAIRE',
        label: 'Dentaire',
        namePlaceholder: 'Cabinet Santé Plus',
        roomPlaceholder: "Ex: Salle d'examen",
        roomSuggestions: [
            "Salle d'examen",
            "Salle de radiologie",
            "Salle d'hygiène"
        ],
        servicesRecommended: [
            'Consultation dentaire',
            'Détartrage',
            'Traitement carie',
            'Radio panoramique'
        ]
    },
    MEDICAL_GENERAL: {
        key: 'MEDICAL_GENERAL',
        label: 'Médecine générale',
        namePlaceholder: 'Cabinet Santé Plus',
        roomPlaceholder: "Ex: Salle de consultation",
        roomSuggestions: [
            "Salle de consultation",
            "Salle d'examen",
            "Salle de prélèvements"
        ],
        servicesRecommended: [
            'Consultation',
            'Visite de suivi',
            'Téléconsultation',
            'Vaccination'
        ]
    },
    AUTRE: {
        key: 'AUTRE',
        label: 'Autre',
        namePlaceholder: 'Cabinet Santé Plus',
        roomPlaceholder: "Ex: Salle de consultation",
        roomSuggestions: [
            "Salle de consultation",
            "Salle d'attente"
        ],
        servicesRecommended: [
            'Consultation',
            'Suivi',
            'Bilan'
        ]
    }
}

// Animation variants for staggered children
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
}


export default function OnboardingWizard() {
	const router = useRouter()
	const [current, setCurrent] = useState(0)
    const [direction, setDirection] = useState(1) // 1 for next, -1 for back
	const [state, setState] = useState({
		type: null,
		name: '',
		rooms: [],
        services: [],
		tarifs: [],
		hours: null,
		users: [],
		notifications: null,
	})
	const [saving, setSaving] = useState(false)
	const step = stepsDefinition[current]

	const canContinue = useMemo(() => {
		if (!step) return false
		if (!step.required) return true
		if (step.key === 'type') return Boolean(state.type)
		if (step.key === 'name') return state.name.trim().length >= 2
		return true
	}, [step, state])

	const handleNext = async () => {
		if (!canContinue) return
        setSaving(true)
		try {
			if (step.key === 'type' && state.type) {
                await fetch('/api/cabinet/update-type', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cabinetType: state.type }) })
			}
			if (step.key === 'name' && state.name.trim()) {
                const resp = await fetch('/api/cabinet/update-name', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: state.name.trim() }) })
				if (!resp.ok) {
					const data = await resp.json().catch(() => ({}))
					throw new Error(data?.error || 'Impossible de sauvegarder le nom du cabinet')
				}
			}
            if (step.key === 'tarifs' && state.tarifs.length > 0) {
                // Persist tarifs immediately
                await Promise.all(state.tarifs.map(tarif =>
                    (tarif?.nom && (typeof tarif?.montant === 'number'))
                        ? fetch('/api/tarifs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tarif) })
                        : null
                ))
            }
		} finally {
			setSaving(false)
		}
        setDirection(1)
		setCurrent((c) => Math.min(c + 1, stepsDefinition.length - 1))
	}

    const handleBack = () => {
        setDirection(-1)
        setCurrent((c) => Math.max(c - 1, 0))
    }

	const handleFinish = async () => {
		setSaving(true)
		try {
            // Your finish logic remains the same
			if (state.rooms.length > 0) {
                await Promise.all(state.rooms.map(room => room?.nom && fetch('/api/rooms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(room) })))
			}
			if (state.tarifs.length > 0) {
                await Promise.all(state.tarifs.map(tarif => tarif?.nom && tarif?.montant && fetch('/api/tarifs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tarif) })))
			}
			if (state.hours) {
				await fetch('/api/settings/working-hours', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workingHours: state.hours }) })
			}
			if (state.notifications) {
				await fetch('/api/settings/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(state.notifications) })
			}
			if (state.users.length > 0) {
                await Promise.all(state.users.map(user => user?.email && user?.name && user?.role && user?.password && fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(user) })))
            }
			await fetch('/api/cabinet/complete-onboarding', { method: 'PUT' })
			document.cookie = 'onboardingCompleted=true; path=/'
			router.push('/dashboard?onboarding=completed')
		} finally {
			setSaving(false)
		}
	}

    // Main content transition animation
    const contentVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 30 : -30,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 30 : -30,
            opacity: 0
        })
    };

	return (
        <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                
                {/* Left Sidebar: Stepper */}
                <div className="md:col-span-4">
                    <WizardSidebar current={current} />
				</div>

                {/* Right Content */}
                <div className="md:col-span-8 space-y-6">
                    <ProgressBar current={current} total={stepsDefinition.length} />
                    
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-10 min-h-[520px] h-[80vh] flex flex-col overflow-hidden">
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div 
                                key={step.key} 
                                custom={direction}
                                variants={contentVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.3 }}
                                className="flex-grow min-h-0 flex flex-col"
                            >
                                <div className="flex-1 min-h-0 overflow-y-auto pr-2 scroll-smooth invisible-hover">
                                    {step.key === 'type' && <TypeStep value={state.type} onChange={(v) => setState((prev) => ({ ...prev, type: v }))} />}
                                    {step.key === 'name' && <NameStep moduleKey={state.type} value={state.name} onChange={(v) => setState((prev) => ({ ...prev, name: v }))} />}
                                    {step.key === 'rooms' && <RoomsStep moduleKey={state.type} value={state.rooms} onChange={(v) => setState((prev) => ({ ...prev, rooms: v }))} />}
                                    {step.key === 'services' && <ServicesStep moduleKey={state.type} value={state.services} onChange={(v) => setState((prev) => ({ ...prev, services: v }))} />}
                                    {step.key === 'tarifs' && <TarifsStep moduleKey={state.type} services={state.services} value={state.tarifs} onChange={(v) => setState((prev) => ({ ...prev, tarifs: v }))} />}
                                    {step.key === 'hours' && <HoursStep value={state.hours} onChange={(v) => setState((prev) => ({ ...prev, hours: v }))} />}
                                    {step.key === 'users' && <UsersStep value={state.users} onChange={(v) => setState((prev) => ({ ...prev, users: v }))} />}
                                    {step.key === 'notifications' && <NotificationsStep value={state.notifications} onChange={(v) => setState((prev) => ({ ...prev, notifications: v }))} />}
				</div>

					{/* Footer navigation */}
                                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                                    <NavButton onClick={handleBack} disabled={current === 0 || saving} direction="back" />
							{current < stepsDefinition.length - 1 ? (
                                        <NavButton onClick={handleNext} disabled={!canContinue || saving} saving={saving} direction="next" />
							) : (
                                        <NavButton onClick={handleFinish} disabled={saving} saving={saving} direction="finish" />
							)}
						</div>
                            </motion.div>
                        </AnimatePresence>
					</div>
				</div>
			</div>
		</div>
	)
}

// --- Sub-components ---

function WizardSidebar({ current }) {
	return (
        <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-800">Configuration</h1>
            <p className="text-slate-500 pb-4">Suivez ces étapes pour préparer votre espace de travail.</p>
            <ol className="relative space-y-1">
                {stepsDefinition.map((s, idx) => (
                    <li key={s.key} className="relative">
                        {current === idx && (
                            <motion.div
                                layoutId="active-step-highlight"
                                className="absolute inset-0 bg-blue-50 border border-blue-200 rounded-lg"
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            />
                        )}
                        <a href="#" className="relative flex items-center p-3 text-sm font-medium text-slate-700 transition">
                            <motion.div 
                                className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full mr-3"
                                animate={idx <= current ? "completed" : "incomplete"}
                                variants={{
                                    completed: { backgroundColor: '#2563eb', color: '#ffffff' },
                                    incomplete: { backgroundColor: '#e2e8f0', color: '#64748b' }
                                }}
                                transition={{ duration: 0.3 }}
                            >
                                {idx < current ? <CheckCircle2 size={16} /> : <s.icon size={16} />}
                            </motion.div>
                            <div className="flex flex-col">
                                <span className={`${current === idx ? 'text-blue-700 font-semibold' : ''}`}>{s.title}</span>
                                <span className={`text-xs ${current === idx ? 'text-blue-600' : 'text-slate-500'}`}>{s.description}</span>
                            </div>
                        </a>
                    </li>
                ))}
            </ol>
		</div>
	)
}

function ProgressBar({ current, total }) {
    const progress = ((current + 1) / total) * 100;
	return (
        <div className="w-full bg-slate-200 rounded-full h-2">
            <motion.div 
                className="bg-blue-600 h-2 rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            />
		</div>
	)
}

function NavButton({ onClick, disabled, saving = false, direction }) {
    const content = {
        back: { text: "Retour", icon: <ChevronLeft size={16} className="mr-1" /> },
        next: { text: "Suivant", icon: <ChevronRight size={16} className="ml-1" />, savingText: "Sauvegarde..." },
        finish: { text: "Terminer", icon: null, savingText: "Finalisation..." },
    }[direction];
    
    const baseClasses = "inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-semibold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const colorClasses = direction === 'back' 
        ? "bg-transparent border border-slate-300 text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400"
        : (direction === 'next' 
            ? "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500"
            : "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500");

    return (
        <motion.button 
            onClick={onClick} 
            disabled={disabled}
            className={`${baseClasses} ${colorClasses}`}
            whileHover={{ scale: disabled ? 1 : 1.03 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
        >
            {saving ? (
                <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    {content.savingText}
                </>
            ) : (
                <>
                    {direction === 'back' && content.icon}
                    {content.text}
                    {direction === 'next' && content.icon}
                </>
            )}
        </motion.button>
    )
}

// --- Step Components (Enhanced UI/UX) ---

function StepHeader({ title, subtitle }) {
    return (
        <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
            <p className="text-slate-500 mt-1">{subtitle}</p>
        </motion.div>
    )
}

function TypeStep({ value, onChange }) {
    const types = Object.values(MODULES).map(m => ({ value: m.key, label: m.label }))
    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            <StepHeader title="Quel est votre type de cabinet ?" subtitle="Cette information nous aidera à personnaliser votre expérience." />
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {types.map((t) => (
                    <motion.button 
                        key={t.value} 
                        type="button" 
                        onClick={() => onChange(t.value)}
                        className={`relative p-5 rounded-xl border-2 text-left transition-all duration-200 ${value === t.value ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-200' : 'border-slate-200 hover:border-slate-300'}`}
                        whileHover={{ y: -2 }}
                    >
                        {value === t.value && <div className="absolute top-3 right-3 h-5 w-5 bg-blue-600 text-white rounded-full flex items-center justify-center"><CheckCircle2 size={12}/></div>}
                        <div className="font-semibold text-slate-900">{t.label}</div>
                    </motion.button>
                ))}
            </motion.div>
        </motion.div>
    )
}

function NameStep({ moduleKey, value, onChange }) {
    const moduleCfg = MODULES[moduleKey] || MODULES.AUTRE
    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            <StepHeader title="Comment s'appelle votre cabinet ?" subtitle="Un nom clair et professionnel. Modifiable plus tard dans les paramètres." />
            <motion.div variants={itemVariants}>
                <div className="relative">
                    <TextCursorInput className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                        value={value} 
                        onChange={(e) => onChange(e.target.value)} 
                        placeholder={`Ex: ${moduleCfg.namePlaceholder}`} 
                        className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-[#2F4A5C] placeholder-[#3A5166]" 
                        maxLength={80} 
                    />
                </div>
            </motion.div>
        </motion.div>
    )
}

function RoomsStep({ moduleKey, value, onChange }) {
    const moduleCfg = MODULES[moduleKey] || MODULES.AUTRE
	const [name, setName] = useState('')
    
    const add = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onChange([...value, { id: Date.now(), nom: name.trim(), capacite: 1 }]);
        setName('');
    }
    
    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            <StepHeader title="Ajoutez vos salles" subtitle="Saisissez vos espaces de travail (optionnel)." />
            
            <motion.form variants={itemVariants} onSubmit={add} className="flex gap-2">
                <input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder={moduleCfg.roomPlaceholder} 
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-[#2F4A5C] placeholder-[#3A5166]" 
                />
                <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg inline-flex items-center gap-2 hover:bg-blue-700 transition"
                >
                    <PlusCircle size={16}/> Ajouter
                </button>
            </motion.form>
            
            {value.length > 0 && (
                <motion.div variants={itemVariants} className="space-y-3">
                    <AnimatePresence>
                        {value.map((room, idx) => (
                            <motion.div
                                key={room.id}
                                layout
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                                className="rounded-lg border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-2 sm:p-3 shadow"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                                            {idx + 1}
                                        </div>
                                        <div className="text-sm font-semibold text-slate-800">
                                            {room.nom}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500">Capacité</span>
                                        <input
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={room.capacite}
                                            onChange={(e) => {
                                                const capacity = parseInt(e.target.value) || 1;
                                                onChange(value.map(r => r.id === room.id ? { ...r, capacite: capacity } : r));
                                            }}
                                            className="w-16 px-2 py-1 border border-slate-200 rounded-lg outline-none focus:outline-none focus:ring-0 focus:border-slate-200 text-center text-[#2F4A5C]"
                                        />
                                        <button
                                            onClick={() => onChange(value.filter(r => r.id !== room.id))}
                                            className="ml-2 text-slate-400 hover:text-red-600 transition p-1"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </motion.div>
    )
}

function ServicesStep({ moduleKey, value, onChange }) {
    const moduleCfg = MODULES[moduleKey] || MODULES.AUTRE
    const [serviceName, setServiceName] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editName, setEditName] = useState('')
    const [originalName, setOriginalName] = useState('')

    const toggleService = (name) => {
        const exists = value.includes(name)
        onChange(exists ? value.filter(s => s !== name) : [...value, name])
    }

    const addCustomService = (e) => {
        e.preventDefault()
        const name = serviceName.trim()
        if (!name) return
        if (!value.includes(name)) onChange([...value, name])
        setServiceName('')
    }

    const recommended = moduleCfg.servicesRecommended || []
    const custom = value.filter((s) => !recommended.includes(s))

    // Build display list: recommended first, then insert custom services
    const buildDisplayList = () => {
        const base = recommended.map((name) => ({ name, isCustom: false }))
        // Find last index of a selected service among recommended
        let lastSelectedIndex = -1
        for (let i = 0; i < base.length; i++) {
            if (value.includes(base[i].name)) lastSelectedIndex = i
        }
        // If none selected, append customs at end
        let insertIndex = lastSelectedIndex === -1 ? base.length : lastSelectedIndex + 1
        const result = [...base]
        for (const svc of custom) {
            result.splice(insertIndex, 0, { name: svc, isCustom: true })
            insertIndex += 1
        }
        return result
    }
    const displayServices = buildDisplayList()

    // Preselect all recommended on first visit for this module
    useEffect(() => {
        if (!moduleKey) return
        if (value.length === 0 && recommended.length > 0) {
            onChange([...recommended])
        }
    }, [moduleKey])

    const openEditModal = (name) => {
        setOriginalName(name)
        setEditName(name)
        setIsModalOpen(true)
    }

    const closeEditModal = () => {
        setIsModalOpen(false)
        setEditName('')
        setOriginalName('')
    }

    const saveEdit = () => {
        const trimmed = editName.trim()
        if (!trimmed) return
        const next = value.map(s => s === originalName ? trimmed : s)
        onChange(next)
        closeEditModal()
    }

    const deleteService = () => {
        onChange(value.filter(s => s !== originalName))
        closeEditModal()
    }

	return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            <StepHeader title="Services du cabinet" subtitle="Sélectionnez vos services principaux. Ajoutez-en si nécessaire." />
            
            <motion.form variants={itemVariants} onSubmit={addCustomService} className="flex gap-2">
                <input 
                    value={serviceName} 
                    onChange={(e) => setServiceName(e.target.value)} 
                    placeholder="Ajouter un service" 
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-[#2F4A5C] placeholder-[#3A5166]" 
                />
                <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg inline-flex items-center gap-2 hover:bg-blue-700 transition"
                >
                    <PlusCircle size={16}/> Ajouter
                </button>
            </motion.form>
            
            {displayServices.length > 0 && (
                <motion.div variants={itemVariants} className="space-y-3">
                    <AnimatePresence>
                        {displayServices.map(({ name, isCustom }, idx) => (
                            <motion.div
                                key={name}
                                layout
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                                className="rounded-lg border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-2 sm:p-3 shadow"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                                            {idx + 1}
                                        </div>
                                        <button 
                                            type="button" 
                                            className="text-left text-sm font-semibold text-slate-800 flex-1" 
                                            onClick={() => { if (isCustom) openEditModal(name) }}
                                        >
                                            {name}
                                            {isCustom && <span className="ml-2 text-xs text-blue-600">(personnalisé)</span>}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500">Actif</span>
                                        <input 
                                            type="checkbox" 
                                            checked={value.includes(name)} 
                                            onChange={() => toggleService(name)}
                                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                        />
                                    </div>
			</div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
            
            {/* Modal for editing/deleting custom services */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.95, opacity: 0 }} 
                            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md"
                        >
                            <h3 className="text-lg font-semibold text-slate-800 mb-3">Modifier le service</h3>
                            <input 
                                value={editName} 
                                onChange={(e) => setEditName(e.target.value)} 
                                className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-[#2F4A5C] placeholder-[#3A5166]" 
                                placeholder="Nom du service" 
                            />
                            <div className="mt-4 flex justify-end gap-2">
                                <button 
                                    type="button" 
                                    onClick={deleteService} 
                                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                                >
                                    Supprimer
                                </button>
                                <button 
                                    type="button" 
                                    onClick={closeEditModal} 
                                    className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition"
                                >
                                    Annuler
                                </button>
                                <button 
                                    type="button" 
                                    onClick={saveEdit} 
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                                >
                                    Enregistrer
                                </button>
		</div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

// Remaining steps with the same modern design and animations

function TarifsStep({ moduleKey, services = [], value, onChange }) {
	const moduleCfg = MODULES[moduleKey] || MODULES.AUTRE

    // Custom add removed per request

	return (
		<motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
			<StepHeader title="Tarifs par service" subtitle="Renseignez le prix pour chaque service sélectionné." />
			{services.length > 0 && (
				<motion.div variants={itemVariants} className="space-y-3">
					{services.map((label, idx) => {
						const existing = value.find(v => v.nom === label)
						return (
							<div key={label} className="rounded-lg border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-2 sm:p-3 shadow">
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
									<div className="flex items-center gap-3">
										<div className="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">{idx + 1}</div>
										<div className="text-sm font-semibold text-slate-800">{label}</div>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-xs text-slate-500">Prix (€)</span>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            pattern="[0-9]*[.,]?[0-9]*"
                                            placeholder="0"
                                            value={existing?.montant ?? ''}
                                            onChange={(e) => {
                                                const inputValue = e.target.value
                                                
                                                // Allow empty input for deletion
                                                if (inputValue === '') {
                                                    const next = value.filter(v => v.nom !== label)
                                                    onChange(next)
                                                    return
                                                }
                                                
                                                const normalized = inputValue.replace(',', '.')
                                                const amt = parseFloat(normalized)
                                                
                                                // Only proceed if it's a valid number
                                                if (!Number.isNaN(amt) && amt >= 0) {
                                                    const next = value.some(v => v.nom === label)
                                                        ? value.map(v => v.nom === label ? { ...v, montant: amt } : v)
                                                        : [...value, { id: Date.now() + Math.random(), nom: label, montant: amt }]
                                                    onChange(next)
                                                }
                                            }}
                                            className="w-28 px-3 py-1 border border-slate-200 rounded-lg outline-none focus:outline-none focus:ring-0 focus:border-slate-200 text-right text-[#2F4A5C]"
                                        />
									</div>
			</div>
		</div>
						)
					})}
				</motion.div>
			)}
		</motion.div>
	)
}

function HoursStep({ value, onChange }) {
	const initial = value || null
	const [hours, setHours] = useState(initial)

	useEffect(() => { if (hours) onChange(hours) }, [hours])

	const setWeek = () => setHours({
			monday: { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isActive: true },
			tuesday: { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isActive: true },
			wednesday: { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isActive: true },
			thursday: { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isActive: true },
			friday: { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isActive: true },
			saturday: { dayOfWeek: 6, startTime: '09:00', endTime: '13:00', isActive: false },
			sunday: { dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isActive: false },
		})

	const clear = () => setHours(null)
	const days = [
		['monday', 'Lundi'],
		['tuesday', 'Mardi'],
		['wednesday', 'Mercredi'],
		['thursday', 'Jeudi'],
		['friday', 'Vendredi'],
		['saturday', 'Samedi'],
		['sunday', 'Dimanche'],
	]

	const updateField = (key, field, v) => setHours((prev) => ({ ...prev, [key]: { ...(prev?.[key] || {}), [field]: v } }))

	return (
		<motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
			<StepHeader title="Définissez vos horaires" subtitle="Générez une semaine type et ajustez chaque jour." />
			<motion.div variants={itemVariants} className="flex flex-wrap gap-2">
				<button type="button" onClick={setWeek} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Semaine type</button>
				<button type="button" onClick={clear} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition">Effacer</button>
			</motion.div>
			{hours ? (
				<motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{days.map(([key, label]) => (
						<div key={key} className="p-3 rounded-xl border-2 border-slate-200">
							<div className="flex items-center justify-between mb-2">
								<span className="font-semibold text-slate-800">{label}</span>
								<label className="inline-flex items-center gap-2 text-sm">
									<input type="checkbox" checked={hours?.[key]?.isActive || false} onChange={(e) => updateField(key, 'isActive', e.target.checked)} />
									<span className="text-slate-600">Actif</span>
								</label>
							</div>
							<div className="grid grid-cols-2 gap-2">
								<input type="time" value={hours?.[key]?.startTime || ''} onChange={(e) => updateField(key, 'startTime', e.target.value)} className="px-3 py-2 rounded-lg border-2 border-slate-200 text-[#2F4A5C]" />
								<input type="time" value={hours?.[key]?.endTime || ''} onChange={(e) => updateField(key, 'endTime', e.target.value)} className="px-3 py-2 rounded-lg border-2 border-slate-200 text-[#2F4A5C]" />
							</div>
		</div>
					))}
				</motion.div>
			) : (
				<motion.p variants={itemVariants} className="text-slate-500">Aucun horaire défini. Cliquez sur "Semaine type" pour commencer.</motion.p>
			)}
		</motion.div>
	)
}

function UsersStep({ value, onChange }) {
	const [email, setEmail] = useState('')
	const [name, setName] = useState('')
	const [role, setRole] = useState('KINE')
	const [password, setPassword] = useState('')

	const add = (e) => {
		e.preventDefault()
		if (!email || !name || !password) return
		onChange([ ...value, { id: Date.now(), email, name, role, password } ])
		setEmail(''); setName(''); setPassword('')
	}

	return (
		<motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
			<StepHeader title="Invitez votre équipe" subtitle="Ajoutez vos collaborateurs (optionnel)." />
			<motion.form variants={itemVariants} onSubmit={add} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
				<input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@cabinet.com" type="email" className="px-3 py-2 border-2 border-slate-200 rounded-lg text-[#2F4A5C] placeholder-[#3A5166]" />
				<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom" className="px-3 py-2 border-2 border-slate-200 rounded-lg text-[#2F4A5C] placeholder-[#3A5166]" />
				<select value={role} onChange={(e) => setRole(e.target.value)} className="px-3 py-2 border-2 border-slate-200 rounded-lg text-[#2F4A5C]">
					<option value="KINE">Kiné</option>
					<option value="SECRETAIRE">Secrétaire</option>
				</select>
				<input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" type="password" className="px-3 py-2 border-2 border-slate-200 rounded-lg text-[#2F4A5C] placeholder-[#3A5166]" />
				<div className="sm:col-span-4">
					<button type="submit" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg inline-flex items-center gap-2 hover:bg-blue-700 transition"><PlusCircle size={16}/> Ajouter</button>
			</div>
			</motion.form>
			<motion.ul variants={itemVariants} className="mt-2 space-y-2 max-h-48 overflow-y-auto">
				<AnimatePresence>
				{value.map((u, i) => (
						<motion.li key={u.id} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }} className="px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
							<span className="font-medium text-slate-700">{u.name} – {u.email} ({u.role})</span>
							<button onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-600 transition"><Trash2 size={16}/></button>
						</motion.li>
					))}
				</AnimatePresence>
			</motion.ul>
		</motion.div>
	)
}

function NotificationsStep({ value, onChange }) {
	const [emailNotif, setEmailNotif] = useState(value?.emailNotifications ?? true)
	const [reminders, setReminders] = useState(value?.appointmentReminders ?? true)
	const [reminderTime, setReminderTime] = useState(value?.reminderTime ?? 24)

	useEffect(() => {
		onChange({ emailNotifications: emailNotif, appointmentReminders: reminders, reminderTime })
	}, [emailNotif, reminders, reminderTime])

	return (
		<motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
			<StepHeader title="Notifications" subtitle="Choisissez comment et quand prévenir vos patients (optionnel)." />
			<motion.div variants={itemVariants} className="space-y-3">
				<label className="flex items-center gap-3">
				<input type="checkbox" checked={emailNotif} onChange={(e) => setEmailNotif(e.target.checked)} />
					<span className="text-slate-700">Notifications par email</span>
			</label>
				<label className="flex items-center gap-3">
				<input type="checkbox" checked={reminders} onChange={(e) => setReminders(e.target.checked)} />
					<span className="text-slate-700">Rappels de rendez-vous</span>
			</label>
				<div className="flex items-center gap-3">
					<span className="text-slate-700">Heure du rappel:</span>
					<select value={reminderTime} onChange={(e) => setReminderTime(parseInt(e.target.value))} className="px-3 py-2 border-2 border-slate-200 rounded-lg text-[#2F4A5C]">
						<option value={1}>1h avant</option>
						<option value={3}>3h avant</option>
						<option value={6}>6h avant</option>
						<option value={12}>12h avant</option>
						<option value={24}>24h avant</option>
						<option value={48}>48h avant</option>
					</select>
		</div>
			</motion.div>
		</motion.div>
	)
}



