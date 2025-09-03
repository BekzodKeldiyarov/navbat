# Архитектура проекта Navbat

## Обзор архитектуры

Проект Navbat построен на принципах современной веб-разработки с использованием Next.js 14, TypeScript и React. Архитектура следует принципам SOLID, DRY и разделения ответственности.

## Слои архитектуры

### 1. Presentation Layer (UI)
**Расположение:** `src/components/`

Компоненты разделены на три категории:
- **Base UI** (`src/components/ui/`) - переиспользуемые компоненты
- **Business** (`src/components/business/`) - компоненты для бизнес-логики
- **Reservation** (`src/components/reservation/`) - компоненты для записей

**Принципы:**
- Компоненты только отображают данные и обрабатывают пользовательский ввод
- Бизнес-логика вынесена в хуки и сервисы
- Используют TypeScript для типизации пропсов
- Следуют принципу единственной ответственности

### 2. Business Logic Layer
**Расположение:** `src/hooks/`, `src/lib/`.

**Хуки (`src/hooks/`):**
- `useCategories` - управление категориями и их состоянием
- `useBusinesses` - работа с данными клиник
- `useReservationSteps` - управление процессом записи
- `useAuth` - аутентификация и авторизация

**Сервисы (`src/lib/`):**
- `AuthService` - логика аутентификации
- `StorageService` - работа с localStorage
- `ApiClient` - HTTP клиент для API

**Принципы:**
- Хуки содержат только логику управления состоянием
- Сервисы инкапсулируют бизнес-операции
- Используют паттерн Singleton для сервисов
- Обработка ошибок централизована

### 3. Data Layer
**Расположение:** `src/lib/apiClient.ts`, `src/config/`

**API Client:**
- Централизованный HTTP клиент
- Автоматическое добавление заголовков авторизации
- Retry логика с экспоненциальной задержкой
- Обработка различных форматов ответов

**Конфигурация:**
- API endpoints в `src/config/api.ts`
- Константы приложения в `src/lib/constants.ts`
- Настройки окружения

### 4. State Management Layer
**Расположение:** `src/contexts/`

**AuthContext:**
- Управление состоянием аутентификации
- Использует useReducer для сложной логики
- Автоматическое перенаправление после входа
- Обработка ошибок аутентификации

**Принципы:**
- Context API для глобального состояния
- useReducer для сложной логики состояний
- Локальное состояние в компонентах и хуках
- Избегание prop drilling

## Паттерны проектирования

### 1. Singleton Pattern
```typescript
// StorageService и AuthService используют Singleton
export class StorageService {
  private static instance: StorageService;
  
  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }
}
```

### 2. Factory Pattern
```typescript
// Создание компонентов с Error Boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
```

### 3. Strategy Pattern
```typescript
// Различные стратегии валидации
export const phoneSchema = z.string().regex(PHONE_REGEX);
export const smsCodeSchema = z.string().length(SMS_CODE_LENGTH);
```

### 4. Observer Pattern
```typescript
// React Context для подписки на изменения состояния
const { isAuthenticated, user } = useAuth();
```

## Поток данных

### 1. Инициализация приложения
```
App → Layout → AuthProvider → ErrorBoundary → Pages
```

### 2. Аутентификация
```
User Input → Form → AuthService → API → StorageService → AuthContext → Redirect
```

### 3. Загрузка данных
```
Component → Hook → ApiClient → API → State Update → Re-render
```

### 4. Обработка ошибок
```
Error → ErrorBoundary → Fallback UI → User Action → Recovery
```

## Безопасность

### 1. Аутентификация
- JWT токены для авторизации
- Автоматическое добавление заголовка Authorization
- Проверка валидности токенов

### 2. Валидация данных
- Валидация на клиенте с помощью Zod
- Проверка форматов данных
- Санитизация пользовательского ввода

### 3. Безопасность API
- API ключи в заголовках
- HTTPS для всех запросов
- Обработка ошибок без утечки информации

## Производительность

### 1. Оптимизация React
- Использование useCallback и useMemo
- Мемоизация компонентов
- Оптимизация перерендеров

### 2. Оптимизация сети
- Retry логика для неудачных запросов
- Кэширование данных в localStorage
- Ленивая загрузка компонентов

### 3. Оптимизация сборки
- Tree shaking
- Code splitting
- Оптимизация изображений

## Масштабируемость

### 1. Модульная архитектура
- Компоненты легко заменяются
- Сервисы можно расширять
- Хуки переиспользуются

### 2. Типизация
- TypeScript обеспечивает безопасность типов
- Интерфейсы легко расширяются
- Компилятор проверяет корректность

### 3. Тестируемость
- Компоненты легко тестировать
- Сервисы можно мокать
- Хуки изолированы

## Мониторинг и логирование

### 1. Error Boundaries
- Перехват ошибок React
- Graceful fallback UI
- Логирование ошибок

### 2. Логирование
- Консольные логи в development
- Возможность интеграции с внешними сервисами
- Структурированные сообщения об ошибках

## Развертывание

### 1. Сборка
- Оптимизированная сборка Next.js
- Минификация кода
- Tree shaking

### 2. Развертывание
- Статические файлы для CDN
- Server-side rendering для SEO
- Оптимизация для мобильных устройств

## Будущие улучшения

### 1. Архитектурные улучшения
- Микросервисная архитектура
- GraphQL для API
- WebSocket для real-time обновлений

### 2. Производительность
- Service Workers для кэширования
- Virtual scrolling для больших списков
- Оптимизация изображений

### 3. Безопасность
- OAuth 2.0 интеграция
- Двухфакторная аутентификация
- Аудит безопасности

---

Эта архитектура обеспечивает:
- **Масштабируемость** - легко добавлять новые функции
- **Поддерживаемость** - код легко понимать и изменять
- **Тестируемость** - компоненты и логика легко тестировать
- **Производительность** - оптимизированная работа приложения
- **Безопасность** - защита от основных угроз
