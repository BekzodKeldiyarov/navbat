'use client';

import { useEffect } from 'react';
import { usePersonProfile } from '@/hooks/usePersonProfile';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function PersonProfilesPage() {
  const { personProfiles, loading, error, fetchPersonProfiles, refetch } = usePersonProfile();

  useEffect(() => {
    fetchPersonProfiles();
  }, [fetchPersonProfiles]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading text="Загрузка профилей пользователей..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Error message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Профили пользователей
        </h1>
        <Button onClick={refetch} variant="secondary">
          Обновить данные
        </Button>
      </div>

      {personProfiles.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500">Профили пользователей не найдены</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {personProfiles.map((profile) => (
            <Card key={profile.person_id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {profile.first_name} {profile.last_name} {profile.patronymic}
                  </h3>
                  <p className="text-sm text-gray-500">ID: {profile.person_id}</p>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Имя:</span>
                    <p className="text-sm text-gray-900">{profile.first_name || 'Не указано'}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-700">Фамилия:</span>
                    <p className="text-sm text-gray-900">{profile.last_name || 'Не указано'}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-700">Отчество:</span>
                    <p className="text-sm text-gray-900">{profile.patronymic || 'Не указано'}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-700">Телефон:</span>
                    <p className="text-sm text-gray-900">{profile.phone_number || 'Не указан'}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6 text-sm text-gray-500">
        Всего профилей: {personProfiles.length}
      </div>
    </div>
  );
}
