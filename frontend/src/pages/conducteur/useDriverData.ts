import { useAuthStore } from '@/store/authStore'
import { useFleetStore } from '@/store/fleetStore'

export function useDriverData() {
  const user = useAuthStore((s) => s.user)
  const { missions, vehicles, drivers } = useFleetStore()

  const driver = drivers.find((d) => d.id === user?.driverId)
  const mission = missions.find(
    (m) => m.driverId === driver?.id && m.status !== 'cloturee'
  )
  const vehicle = vehicles.find((v) => v.id === mission?.vehicleId)

  return { user, driver, mission, vehicle }
}
