import { useStore } from '../../store/StoreContext'
import { Card, EmptyState, PageTitle, QuoteStatusBadge } from '../../components/ui'

const SUPPLIER_ID = 'u-sup-1'

export default function SupplierEquipment() {
  const { quoteRequests, equipment } = useStore()
  const myRequests = quoteRequests.filter((qr) => qr.supplierId === SUPPLIER_ID)

  return (
    <div className="max-w-4xl">
      <PageTitle
        title="Demandes de devis reçues"
        subtitle={`${myRequests.length} demande(s)`}
      />

      {myRequests.length === 0 ? (
        <EmptyState
          title="Aucune demande"
          subtitle="Les clients qui vous demandent un devis apparaîtront ici."
        />
      ) : (
        <div className="grid gap-4">
          {myRequests.map((qr) => {
            const eq = equipment.find((e) => e.id === qr.equipmentId)
            return (
              <Card key={qr.id} className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900">{qr.reference}</h3>
                      <QuoteStatusBadge status={qr.status} />
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      Équipement: <span className="font-semibold">{eq?.name}</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Client</p>
                    <p className="font-semibold text-slate-900">{qr.clientName}</p>
                    <p className="text-sm text-slate-600">{qr.clientCompany}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Contact</p>
                    <p className="text-sm">
                      <a href={`tel:${qr.clientPhone}`} className="text-blue-600 hover:underline">
                        📞 {qr.clientPhone}
                      </a>
                    </p>
                    <p className="text-sm">
                      <a href={`mailto:${qr.clientEmail}`} className="text-blue-600 hover:underline">
                        📧 {qr.clientEmail}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Durée demandée</p>
                    <p className="font-semibold text-slate-900">{qr.duration}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Localisation</p>
                    <p className="font-semibold text-slate-900">{qr.location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Date demandée</p>
                    <p className="font-semibold text-slate-900">{qr.requestedDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Créée le</p>
                    <p className="font-semibold text-slate-900">{new Date(qr.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>

                {qr.message && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700 font-semibold mb-1">Message du client</p>
                    <p className="text-sm text-slate-700">{qr.message}</p>
                  </div>
                )}

                <div className="text-xs text-slate-500">
                  💡 Contactez le client directement pour négocier les tarifs et conditions.
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
