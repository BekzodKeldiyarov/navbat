export async function fetchClinics() {
    return await fetch('/api/clinics').then(res => res.json());
}
