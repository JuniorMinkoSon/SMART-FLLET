import { useStore } from '../../store/StoreContext'
import { Card, PageTitle } from '../../components/ui'
import type { Role } from '../../store/types'

const ROLE_LABEL: Record<Role, { label: string; cls: string }> = {
  ADMIN: { label: 'Admin', cls: 'bg-indigo-100 text-indigo-700' },
  SUPPLIER: { label: 'Fournisseur', cls: 'bg-blue-100 text-blue-700' },
  TECHNICAL: { label: 'Équipe technique', cls: 'bg-emerald-100 text-emerald-700' },
  CLIENT: { label: 'Client', cls: 'bg-slate-100 text-slate-700' },
}

export default function AdminUsers() {
  const { users } = useStore()

  return (
    <div>
      <PageTitle title="Utilisateurs" subtitle="Comptes de la plateforme VOLTA." />
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-700">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Société</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Téléphone</th>
              <th className="px-4 py-3">Ville</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3">{u.company}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_LABEL[u.role].cls}`}>
                    {ROLE_LABEL[u.role].label}
                  </span>
                </td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.phone}</td>
                <td className="px-4 py-3">{u.city}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
