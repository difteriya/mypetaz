import { fmtDate } from './ui';

const SEX_LABEL: Record<string, string> = { MALE: 'Erkək', FEMALE: 'Dişi', UNKNOWN: 'Bilinmir' };
const HEALTH_LABEL: Record<string, string> = { VACCINE: 'Peyvənd', EXAM: 'Müayinə', SURGERY: 'Əməliyyat' };

interface HealthRecord {
  id: string;
  date: Date;
  type: string;
  name: string;
  note: string | null;
  source: string;
}

interface ChartPet {
  sex: string;
  birthDate: Date | null;
  weight: number | null;
  microchipNo: string | null;
  passport: { microchipId: string | null } | null;
  healthRecords: HealthRecord[];
}

/** Pet vitals + full medical history — shared by the appointment detail and the
 * vet-side pet profile (§7.4). */
export function PetChart({ pet }: { pet: ChartPet }) {
  const chip = pet.passport?.microchipId ?? pet.microchipNo;
  return (
    <>
      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-vink/45">Pet kartı</h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 border-y border-vline bg-white p-5 text-sm sm:grid-cols-3">
          <dt className="text-vink/50">Cinsiyyət</dt>
          <dd className="sm:col-span-2">{SEX_LABEL[pet.sex] ?? pet.sex}</dd>
          {pet.birthDate && (
            <>
              <dt className="text-vink/50">Doğum</dt>
              <dd className="font-mono sm:col-span-2">{fmtDate(pet.birthDate)}</dd>
            </>
          )}
          {pet.weight != null && (
            <>
              <dt className="text-vink/50">Çəki</dt>
              <dd className="sm:col-span-2">{pet.weight} kq</dd>
            </>
          )}
          {chip && (
            <>
              <dt className="text-vink/50">Mikroçip</dt>
              <dd className="font-mono sm:col-span-2">{chip}</dd>
            </>
          )}
        </dl>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-vink/45">Tibbi tarixçə</h2>
        {pet.healthRecords.length === 0 ? (
          <div className="border-y border-vline bg-white">
            <p className="py-6 text-center text-sm text-vink/45">Tarixçə boşdur.</p>
          </div>
        ) : (
          <ul className="divide-y divide-vline border-y border-vline bg-white">
            {pet.healthRecords.map((r) => (
              <li key={r.id} className="flex items-start gap-4 px-4 py-2.5 text-sm">
                <span className="w-24 shrink-0 font-mono text-vink/50">{fmtDate(r.date)}</span>
                <span className="min-w-0 flex-1">
                  <span className="font-semibold">{HEALTH_LABEL[r.type] ?? r.type}</span> — {r.name}
                  {r.note && <span className="block text-vink/55">{r.note}</span>}
                </span>
                <span
                  className={`shrink-0 text-[11px] font-bold ${r.source === 'VET' ? 'text-vteal-700' : 'text-vink/45'}`}
                >
                  {r.source === 'VET' ? 'Baytar' : 'Sahib'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
