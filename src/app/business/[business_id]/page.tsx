
'use client';

import {useEffect, useState} from 'react';
import {useParams, useSearchParams} from 'next/navigation';
import {Building2, MapPin, Clock, User, Calendar, Phone, Mail, Globe, Star, Loader2, CheckCircle, X} from 'lucide-react';
import ReservationMethodSelector from '@/components/reservation/ReservationMethodSelector';
import SmsLoginForm from '@/components/reservation/SmsLoginForm';
import { NotificationModal } from '@/components/ui/NotificationModal';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { saveSchedule2 } from '@/lib/apiClient';

interface Category {
    sp_сategorie_id: number;
    name: string;
    parent_id: number;
    count_business: number;
}

interface Business {
    business_id: number;
    parent_business_id: number;
    inn: number;
    addr: string;
    name: string;
    begin_time: string;
    end_time: string;
    description: string;
}

interface Staff {
    staff_id: string;
    last_name: string;
    first_name: string;
    patronymic: string;
    urlimg: string;
    visit_time: number;
    schedule: Array<{
        person_id: string;
        date_time: string;
    }>;
    weekly_schedule: Array<{
        day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
        start: string;
        end: string;
    }>;
}

interface TimeSlot {
    date: string;
    time: string;
    available: boolean;
    booked: boolean;
    weekday: string;
    dateObj: Date; // Add this to store the actual Date object
    formattedDate: string; // Add this for the formatted date display
}

export default function BusinessPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const businessId = params.business_id as string;
    const categoryId = searchParams.get('category');
    
    const [business, setBusiness] = useState<Business | null>(null);
    const [categoryStaff, setCategoryStaff] = useState<Staff[]>([]);
    const [allStaff, setAllStaff] = useState<Staff[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingStaff, setLoadingStaff] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
    
    // Reservation states
    const [selectedDoctor, setSelectedDoctor] = useState<Staff | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [showReservationModal, setShowReservationModal] = useState(false);
    const [reservationForm, setReservationForm] = useState({
        firstName: '',
        lastName: '',
        patronymic: '',
        phoneNumber: '',
        smsCode: ''
    });
    const [smsSent, setSmsSent] = useState(false);
    const [smsSessionId, setSmsSessionId] = useState('');
    const [smsPassword, setSmsPassword] = useState<number | null>(null);
    const [loadingReservation, setLoadingReservation] = useState(false);
    
    // New reservation flow states
    const [showMethodSelector, setShowMethodSelector] = useState(false);
    const [showSmsLogin, setShowSmsLogin] = useState(false);
    const [reservationMethod, setReservationMethod] = useState<'sms-login' | 'quick-reservation' | null>(null);
    const [userAccessToken, setUserAccessToken] = useState<string | null>(null);
    
    // Notification state
    const [notification, setNotification] = useState<{
        isOpen: boolean;
        type: 'success' | 'error' | 'warning' | 'info';
        title?: string;
        message: string;
    }>({
        isOpen: false,
        type: 'info',
        message: ''
    });



    useEffect(() => {
        if (businessId) {
            fetchBusinessData();
        }
    }, [businessId]);

    useEffect(() => {
        // Check for existing access token
        const token = localStorage.getItem('access_token');
        if (token) {
            setUserAccessToken(token);
        }
    }, []);

    useEffect(() => {
        if (business && categoryId) {
            fetchStaffData();
        }
    }, [business, categoryId]);



        const fetchBusinessData = async () => {
        try {
            setLoading(true);
            
            console.log('Fetching business data for ID:', businessId);
            console.log('Category ID from URL:', categoryId);
            
            // Get access token if available
            const accessToken = localStorage.getItem('access_token');
            
            // First try to fetch business details using the businesses endpoint
            let businessData = null;
            
            try {
                const businessRes = await fetch('http://91.99.164.161:4000/proxy/businesses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
                },
                body: JSON.stringify({
                    parameters: { business_id: parseInt(businessId) },
                    offset: 0,
                    limit: 100, // Increased limit to get more businesses
                    orderBy: 'ASC',
                }),
            });

                const businessResult = await businessRes.json();
                console.log('Business API response:', businessResult);
                
                // Check if we got the specific business we requested
                if (businessResult?.data) {
                    businessData = businessResult.data.find((b: any) => b.business_id === parseInt(businessId));
                    console.log('Found business in businesses endpoint:', businessData);
                }
                
                if (!businessData) {
                    console.log('Business not found in businesses endpoint, trying to get all businesses...');
                    // If we didn't find the specific business, try to get ALL businesses and find it
                    const allBusinessesRes = await fetch('http://91.99.164.161:4000/proxy/businesses', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
                        },
                        body: JSON.stringify({
                            parameters: {}, // No parameters to get all businesses
                            offset: 0,
                            limit: 1000, // Large limit to get all businesses
                            orderBy: 'ASC',
                        }),
                    });

                    const allBusinessesResult = await allBusinessesRes.json();
                    console.log('All businesses response:', allBusinessesResult);
                    
                    if (allBusinessesResult?.data) {
                        businessData = allBusinessesResult.data.find((b: any) => b.business_id === parseInt(businessId));
                        console.log('Found business in all businesses:', businessData);
                    }
                }
                
            } catch (e) {
                console.error('Businesses endpoint failed, trying fallback:', e);
            }
            
            // Fallback: if businesses endpoint failed, try to get from categorie-business
            if (!businessData) {
                try {
                    console.log('Trying fallback with categorie-business endpoint...');
                    const fallbackRes = await fetch('http://91.99.164.161:4000/proxy/categorie-business', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
                        },
                        body: JSON.stringify({
                            parameters: { business_id: parseInt(businessId) },
                            offset: 0,
                            limit: 100,
                            orderBy: 'ASC',
                        }),
                    });

                    const fallbackResult = await fallbackRes.json();
                    console.log('Fallback API response:', fallbackResult);
                    
                    // Find the business with matching ID
                    if (fallbackResult?.data) {
                        businessData = fallbackResult.data.find((b: any) => b.business_id === parseInt(businessId));
                        console.log('Found business in fallback:', businessData);
                    }
                } catch (fallbackError) {
                    console.error('Fallback endpoint also failed:', fallbackError);
                }
            }
            
            if (businessData) {
                console.log('Final business data to use:', businessData);
                setBusiness(businessData);
                
                // Fetch categories this business serves
                await fetchBusinessCategories(businessData.business_id);
            } else {
                console.error('No business data found for ID:', businessId);
                setError(`Клиника с ID ${businessId} не найдена. Возможно, ID неверный или клиника была удалена.`);
            }
        } catch (e) {
            console.error('Ошибка при загрузке данных клиники:', e);
            setError('Ошибка при загрузке данных');
        } finally {
            setLoading(false);
        }
    };

    const fetchStaffData = async () => {
        if (!business || !categoryId) return;
        
        try {
            setLoadingStaff(true);
            console.log('Fetching staff for business:', business.business_id, 'and category:', categoryId);
            
            // Get access token if available
            const accessToken = localStorage.getItem('access_token');
            
            // First, get staff for this specific category and business
            const categoryStaffRes = await fetch('http://91.99.164.161:4000/proxy/staff-categorie', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': 'Basic null',
                    'api-key': 'b463026f-f02a-483e-9750-4c3890474604',
                    ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
                },
                body: JSON.stringify({
                    parameters: {
                        business_id: business.business_id,
                        sp_сategorie_id: parseInt(categoryId)
                    },
                    offset: 0,
                    limit: 100,
                    orderBy: 'ASC',
                }),
            });

            const categoryStaffResult = await categoryStaffRes.json();
            const categoryStaffData = categoryStaffResult?.data || [];
            console.log('Category staff:', categoryStaffData);
            setCategoryStaff(categoryStaffData);
            
            // Then, get all staff for this business (for "other doctors" section)
            const allStaffRes = await fetch('http://91.99.164.161:4000/proxy/staff-categorie', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': 'Basic null',
                    'api-key': 'b463026f-f02a-483e-9750-4c3890474604',
                    ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
                },
                body: JSON.stringify({
                    parameters: {
                        business_id: business.business_id,
                        sp_сategorie_id: 0 // Get all staff
                    },
                    offset: 0,
                    limit: 100,
                    orderBy: 'ASC',
                }),
            });

            const allStaffResult = await allStaffRes.json();
            const allStaffData = allStaffResult?.data || [];
            console.log('All staff:', allStaffData);
            setAllStaff(allStaffData);
            
        } catch (e) {
            console.error('Ошибка при загрузке персонала:', e);
        } finally {
            setLoadingStaff(false);
        }
    };

    const fetchBusinessCategories = async (businessId: number) => {
        try {
            // Get access token if available
            const accessToken = localStorage.getItem('access_token');
            
            const res = await fetch('http://91.99.164.161:4000/proxy/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
                },
                body: JSON.stringify({
                    parameters: { business_id: businessId },
                    offset: 0,
                    limit: 100,
                    orderBy: 'ASC',
                }),
            });

            const result = await res.json();
            const categoriesData = result?.data || [];
            setCategories(categoriesData);
            
            // If we have a categoryId from URL, find the current category
            if (categoryId) {
                const currentCat = categoriesData.find((cat: Category) => cat.sp_сategorie_id === parseInt(categoryId));
                setCurrentCategory(currentCat || null);
            }
        } catch (e) {
            console.error('Ошибка при загрузке категорий:', e);
        }
    };

    const formatDay = (day: string) => {
        const dayMap: Record<string, string> = {
            'mon': 'Понедельник',
            'tue': 'Вторник',
            'wed': 'Среда',
            'thu': 'Четверг',
            'fri': 'Пятница',
            'sat': 'Суббота',
            'sun': 'Воскресенье',
            // Russian short day names
            'пн': 'Понедельник',
            'вт': 'Вторник',
            'ср': 'Среда',
            'чт': 'Четверг',
            'пт': 'Пятница',
            'сб': 'Суббота',
            'вс': 'Воскресенье'
        };
        return dayMap[day] || day;
    };

    const formatDayShort = (day: string) => {
        const dayMap: Record<string, string> = {
            'mon': 'Пн',
            'tue': 'Вт',
            'wed': 'Ср',
            'thu': 'Чт',
            'fri': 'Пт',
            'sat': 'Сб',
            'sun': 'Вс'
        };
        return dayMap[day] || day;
    };

    const generateTimeSlots = (doctor: Staff): TimeSlot[] => {
        const slots: TimeSlot[] = [];
        const today = new Date();
        
        // Generate slots for next 7 days
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            // Convert day to English format to match weekly_schedule
            const dayMap: Record<number, string> = {
                0: 'sun', // Sunday
                1: 'mon', // Monday
                2: 'tue', // Tuesday
                3: 'wed', // Wednesday
                4: 'thu', // Thursday
                5: 'fri', // Friday
                6: 'sat'  // Saturday
            };
            const dayOfWeek = dayMap[date.getDay()];
            const workingDay = doctor.weekly_schedule.find(schedule => schedule.day === dayOfWeek);
            
            if (workingDay) {
                const startHour = parseInt(workingDay.start.split(':')[0]);
                const endHour = parseInt(workingDay.end.split(':')[0]);
                
                // Generate 1-hour slots
                for (let hour = startHour; hour < endHour; hour++) {
                    const time = `${hour.toString().padStart(2, '0')}:00`;
                    // Format date as DD.MM.YYYY for the API
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const year = date.getFullYear();
                    const dateStr = `${day}.${month}.${year}`;
                    const dateTimeStr = `${dateStr}T${time}`;
                    
                    // Check if this slot is already booked
                    const isBooked = doctor.schedule.some(booking => 
                        booking.date_time === dateTimeStr
                    );
                    
                    // Format date for display (e.g., "13 августа")
                    const monthNames = [
                        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
                        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
                    ];
                    const formattedDate = `${date.getDate()} ${monthNames[date.getMonth()]}`;
                    
                    slots.push({
                        date: dateStr,
                        time: time,
                        available: !isBooked,
                        booked: isBooked,
                        weekday: formatDayShort(dayOfWeek),
                        dateObj: date,
                        formattedDate: formattedDate
                    });
                }
            }
        }
        
        return slots;
    };

    const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string, title?: string) => {
        setNotification({
            isOpen: true,
            type,
            title,
            message
        });
    };

    const openReservationModal = (doctor: Staff, slot: TimeSlot) => {
        setSelectedDoctor(doctor);
        setSelectedSlot(slot);
        
        // If user already has access token, show reservation form directly with pre-filled data
        if (userAccessToken) {
            // Get user data from localStorage
            const userPhone = localStorage.getItem('phone_number');
            const userFirstName = localStorage.getItem('user_first_name');
            const userLastName = localStorage.getItem('user_last_name');
            const userPatronymic = localStorage.getItem('user_patronymic');
            
            // Pre-fill reservation form with user data
            setReservationForm({
                firstName: userFirstName || '',
                lastName: userLastName || '',
                patronymic: userPatronymic || '',
                phoneNumber: userPhone || '',
                smsCode: ''
            });
            
            setShowReservationModal(true);
            setSmsSent(false);
            setSmsPassword(null);
        } else {
            // Show method selector
            setShowMethodSelector(true);
        }
    };

    const sendSMS = async () => {
        // For authenticated users, use phone from localStorage
        if (userAccessToken) {
            const userPhone = localStorage.getItem('phone_number');
            if (!userPhone) {
                showNotification('error', 'Ошибка: не найден номер телефона пользователя');
                return;
            }
        } else {
            // For non-authenticated users, check phone input
            if (!reservationForm.phoneNumber) {
                showNotification('warning', 'Пожалуйста, введите номер телефона');
                return;
            }
        }

        try {
            setLoadingReservation(true);
            
            // Get access token if available
            const accessToken = localStorage.getItem('access_token');
            
            const phoneNumberToUse = userAccessToken ? localStorage.getItem('phone_number') : reservationForm.phoneNumber;
            
            const res = await fetch('http://91.99.164.161:4000/proxy/send-sms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
                },
                body: JSON.stringify({
                    parameters: {
                        phone_number: phoneNumberToUse
                    },
                    offset: 0,
                    limit: 10,
                    orderBy: 'ASC'
                }),
            });

            const result = await res.json();
            console.log('SMS API response:', result);
            console.log('SMS API response keys:', Object.keys(result));
            console.log('SMS API response data:', result.data);
            
            if (result.result === 'ok' && result.data && result.data.length > 0) {
                const smsData = result.data[0];
                const sessionId = smsData.sms_session_id;
                const smsPasswordValue = smsData.sms_password;
                
                if (!sessionId) {
                    console.error('No SMS session ID found in response data');
                    showNotification('error', 'Ошибка: SMS отправлен, но не получен ID сессии. Попробуйте еще раз или обратитесь в поддержку.');
                    setLoadingReservation(false);
                    return;
                }
                
                // Validate that session ID looks like a UUID
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (!uuidRegex.test(sessionId)) {
                    console.error('Invalid session ID format:', sessionId);
                    showNotification('error', 'Ошибка: получен некорректный ID сессии. Попробуйте еще раз.');
                    setLoadingReservation(false);
                    return;
                }
                
                setSmsSessionId(sessionId);
                setSmsPassword(smsPasswordValue);
                setSmsSent(true);
                console.log('SMS session ID set to:', sessionId);
                console.log('SMS password from API:', smsPasswordValue);
                
                // Show success message with the SMS password for testing
                const phoneNumberToShow = userAccessToken ? localStorage.getItem('phone_number') : reservationForm.phoneNumber;
                showNotification('success', `SMS код отправлен на номер ${phoneNumberToShow}! Код: ${smsPasswordValue} (для тестирования)`, 'SMS отправлен');
            } else {
                showNotification('error', 'Ошибка при отправке SMS: ' + (result.msg || 'Неизвестная ошибка'));
            }
        } catch (e) {
            console.error('Ошибка при отправке SMS:', e);
            showNotification('error', 'Ошибка при отправке SMS');
        } finally {
            setLoadingReservation(false);
        }
    };

    const handleMethodSelect = (method: 'sms-login' | 'quick-reservation') => {
        setReservationMethod(method);
        setShowMethodSelector(false);
        
        if (method === 'sms-login') {
            setShowSmsLogin(true);
        } else {
            // Show quick reservation form
            setShowReservationModal(true);
            setSmsSent(false);
            setSmsPassword(null);
            setReservationForm({
                firstName: '',
                lastName: '',
                patronymic: '',
                phoneNumber: '',
                smsCode: ''
            });
        }
    };

    const handleSmsLoginSuccess = (accessToken: string) => {
        setUserAccessToken(accessToken);
        setShowSmsLogin(false);
        
        // Get user data from localStorage
        const userPhone = localStorage.getItem('phone_number');
        const userFirstName = localStorage.getItem('user_first_name');
        const userLastName = localStorage.getItem('user_last_name');
        const userPatronymic = localStorage.getItem('user_patronymic');
        
        // Pre-fill reservation form with user data
        setReservationForm({
            firstName: userFirstName || '',
            lastName: userLastName || '',
            patronymic: userPatronymic || '',
            phoneNumber: userPhone || '',
            smsCode: ''
        });
        
        // Show reservation modal with pre-filled data
        setShowReservationModal(true);
        setSmsSent(false);
        setSmsPassword(null);
    };

    const handleBackToMethodSelector = () => {
        setShowSmsLogin(false);
        setShowMethodSelector(true);
    };



    const confirmReservation = async () => {
        if (!selectedDoctor || !selectedSlot) {
            console.error('Missing required data:', { selectedDoctor, selectedSlot });
            showNotification('error', 'Ошибка: не выбран врач или время');
            return;
        }

        try {
            setLoadingReservation(true);
            
            // For authenticated users, use SaveSchedule2 API (no SMS required)
            if (userAccessToken) {
                const reservationData = {
                    business_id: parseInt(businessId),
                    last_name: localStorage.getItem('user_last_name') || '',
                    first_name: localStorage.getItem('user_first_name') || '',
                    patronymic: localStorage.getItem('user_patronymic') || '',
                    schedule: `${selectedSlot.date}T${selectedSlot.time}`,
                    phone_number: localStorage.getItem('phone_number') || '',
                    staff_id: selectedDoctor.staff_id
                };
                
                console.log('Sending reservation data (authenticated user):', reservationData);
                
                const result = await saveSchedule2(reservationData);
                console.log('Save schedule 2 API response:', result);
                
                if (result.result === 'ok') {
                    showNotification('success', 'Запись успешно создана!', 'Успешно');
                    setShowReservationModal(false);
                    // Refresh staff data to show updated schedule
                    if (business && categoryId) {
                        fetchStaffData();
                    }
                } else {
                    showNotification('error', 'Ошибка при создании записи: ' + (result.msg || 'Неизвестная ошибка'));
                }
            } else {
                // For non-authenticated users, use original SMS flow
                if (!reservationForm.firstName || !reservationForm.lastName || !reservationForm.phoneNumber || !reservationForm.smsCode) {
                    showNotification('warning', 'Пожалуйста, заполните все обязательные поля');
                    return;
                }

                // Check if we have a valid session ID
                if (!smsSessionId) {
                    console.error('No SMS session ID available');
                    showNotification('error', 'Ошибка: не удалось получить SMS сессию. Попробуйте отправить SMS код снова.');
                    return;
                }

                // Validate session ID format
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (!uuidRegex.test(smsSessionId)) {
                    console.error('Invalid session ID format:', smsSessionId);
                    alert('Ошибка: некорректный ID SMS сессии. Попробуйте отправить SMS код снова.');
                    return;
                }
                
                // Ensure smsCode is a valid number
                const smsPassword = parseInt(reservationForm.smsCode);
                if (isNaN(smsPassword)) {
                    showNotification('error', 'Неверный SMS код: должен быть числом');
                    return;
                }
                
                // Prepare the reservation data for SMS flow
                const reservationData = {
                    business_id: parseInt(businessId),
                    last_name: reservationForm.lastName,
                    first_name: reservationForm.firstName,
                    patronymic: reservationForm.patronymic,
                    schedule: `${selectedSlot.date}T${selectedSlot.time}`,
                    phone_number: reservationForm.phoneNumber,
                    staff_id: selectedDoctor.staff_id,
                    sms_password: smsPassword,
                    sms_session_id: smsSessionId
                };
                
                console.log('Sending reservation data (SMS flow):', reservationData);

                // Get access token if available
                const accessToken = localStorage.getItem('access_token');
                
                const res = await fetch('http://91.99.164.161:4000/proxy/save-schedule', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
                    },
                    body: JSON.stringify({
                        parameters: reservationData,
                        offset: 0,
                        limit: 10,
                        orderBy: 'ASC'
                    }),
                });

                const result = await res.json();
                console.log('Save schedule API response:', result);
                
                if (result.result === 'ok') {
                    showNotification('success', 'Запись успешно создана!', 'Успешно');
                    setShowReservationModal(false);
                    // Refresh staff data to show updated schedule
                    if (business && categoryId) {
                        fetchStaffData();
                    }
                } else {
                    showNotification('error', 'Ошибка при создании записи: ' + (result.msg || 'Неизвестная ошибка'));
                }
            }
        } catch (e) {
            console.error('Ошибка при создании записи:', e);
            showNotification('error', 'Ошибка при создании записи');
        } finally {
            setLoadingReservation(false);
        }
    };

    const renderTimeSlots = (doctor: Staff) => {
        const slots = generateTimeSlots(doctor);
        
        console.log(`Generated ${slots.length} slots for doctor ${doctor.first_name} ${doctor.last_name}:`, slots);
        
        if (slots.length === 0) {
            return (
                <div className="mt-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        Доступные слоты для записи:
                    </h5>
                    <p className="text-gray-500 text-sm">Нет доступных слотов для записи</p>
                </div>
            );
        }
        
        return (
            <div className="mt-4">
                <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Доступные слоты для записи:
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {slots.map((slot, idx) => (
                        <button
                            key={idx}
                            onClick={() => slot.available && openReservationModal(doctor, slot)}
                            disabled={!slot.available}
                            className={`p-3 text-sm rounded-lg border transition-all ${
                                slot.booked
                                    ? 'bg-red-100 border-red-300 text-red-600 cursor-not-allowed'
                                    : slot.available
                                    ? 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200 cursor-pointer hover:shadow-md'
                                    : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            <div className="font-semibold text-xs mb-1">{slot.weekday}</div>
                            <div className="font-bold text-lg mb-1">{slot.time}</div>
                            <div className="text-xs text-gray-600">{slot.formattedDate}</div>
                            {slot.booked && <div className="text-xs mt-1 font-medium">Занято</div>}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-lg text-gray-600">Загрузка информации о клинике...</p>
                </div>
            </div>
        );
    }

    if (error || !business) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 flex items-center justify-center">
                <div className="text-center max-w-2xl">
                    <p className="text-xl text-red-600 mb-4">{error || 'Клиника не найдена'}</p>
                    
                    {/* Debug section to show available businesses */}
                    <div className="bg-gray-100 p-4 rounded-lg mb-4 text-left">
                        <h3 className="font-semibold mb-2">Доступные клиники в системе:</h3>
                        <button 
                            onClick={async () => {
                                try {
                                    const res = await fetch('http://91.99.164.161:4000/proxy/businesses', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ parameters: {}, offset: 0, limit: 100, orderBy: 'ASC' }),
                                    });
                                    const result = await res.json();
                                    console.log('Available businesses:', result);
                                    showNotification('info', `Найдено ${result?.data?.length || 0} клиник. Проверьте консоль для деталей.`, 'Информация');
                                } catch (e) {
                                    showNotification('error', 'Ошибка при получении списка клиник');
                                }
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                        >
                            Показать доступные клиники
                        </button>
                    </div>
                    
                    <button 
                        onClick={() => window.history.back()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Назад
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 py-10 px-4 sm:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{business.name}</h1>
                            <div className="flex items-center gap-6 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-blue-500" />
                                    <span>{business.addr}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-green-500" />
                                    <span>{business.begin_time} - {business.end_time}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                ID: {business.business_id}
                            </div>
                        </div>
                    </div>
                    
                    {business.description && (
                        <p className="text-gray-700 text-lg leading-relaxed">{business.description}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Staff */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <User className="w-6 h-6 text-blue-600" />
                                Врачи и персонал
                            </h2>
                            
                            {loadingStaff ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
                                    <span className="text-gray-600">Загрузка информации о врачах...</span>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Category-specific doctors */}
                                    {categoryId && currentCategory && categoryStaff.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
                                                <User className="w-5 h-5" />
                                                Врачи по специальности "{currentCategory.name}" ({categoryStaff.length})
                                            </h3>
                                            <div className="space-y-4">
                                                {categoryStaff.map((person) => (
                                                    <div key={person.staff_id} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                                                        <div className="flex items-start gap-4">
                                                            {person.urlimg && (
                                                                <img 
                                                                    src={person.urlimg} 
                                                                    alt={`${person.last_name} ${person.first_name}`}
                                                                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = 'none';
                                                                    }}
                                                                />
                                                            )}
                                                            <div className="flex-1">
                                                                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                                                                    {person.last_name} {person.first_name} {person.patronymic}
                                                                </h4>
                                                                
                                                                {person.visit_time && (
                                                                    <div className="text-gray-600 mb-3">
                                                                        <span className="font-medium">Время приема:</span> {person.visit_time} минут
                                                                    </div>
                                                                )}

                                                                {person.weekly_schedule && person.weekly_schedule.length > 0 && (
                                                                    <div className="mb-4">
                                                                        <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                                            <Calendar className="w-4 h-4 text-blue-600" />
                                                                            Рабочие дни:
                                                                        </h5>
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            {person.weekly_schedule.map((schedule, idx) => (
                                                                                <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded border">
                                                                                    <span className="text-sm font-medium text-gray-700">
                                                                                        {formatDay(schedule.day)}
                                                                                    </span>
                                                                                    <span className="text-sm text-gray-600">
                                                                                        {schedule.start} - {schedule.end}
                                                                                    </span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Time slots for reservation */}
                                                                {renderTimeSlots(person)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* All doctors */}
                                    {allStaff.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                                <User className="w-5 h-5" />
                                                Все врачи клиники ({allStaff.length})
                                            </h3>
                                            <div className="space-y-4">
                                                {allStaff.map((person) => (
                                                    <div key={person.staff_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                                        <div className="flex items-start gap-4">
                                                            {person.urlimg && (
                                                                <img
                                                                    src={person.urlimg}
                                                                    alt={`${person.last_name} ${person.first_name}`}
                                                                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = 'none';
                                                                    }}
                                                                />
                                                            )}
                                                            <div className="flex-1">
                                                                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                                                                    {person.last_name} {person.first_name} {person.patronymic}
                                                                </h4>

                                                                {person.visit_time && (
                                                                    <div className="text-gray-600 mb-3">
                                                                        <span className="font-medium">Время приема:</span> {person.visit_time} минут
                                                                    </div>
                                                                )}

                                                                {person.weekly_schedule && person.weekly_schedule.length > 0 && (
                                                                    <div className="mb-4">
                                                                        <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                                            <Calendar className="w-4 h-4 text-gray-600" />
                                                                            Рабочие дни:
                                                                        </h5>
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            {person.weekly_schedule.map((schedule, idx) => (
                                                                                <div key={idx} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                                                                                    <span className="text-sm font-medium text-gray-700">
                                                                                        {formatDay(schedule.day)}
                                                                                    </span>
                                                                                    <span className="text-sm text-gray-600">
                                                                                        {schedule.start} - {schedule.end}
                                                                                    </span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Time slots for reservation */}
                                                                {renderTimeSlots(person)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {!categoryId && allStaff.length === 0 && (
                                        <p className="text-gray-500 text-center py-8">Информация о врачах не найдена</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Categories */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-green-600" />
                                Услуги клиники
                            </h3>

                            {categories.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">Категории услуг не найдены</p>
                            ) : (
                                <div className="space-y-3">
                                    {categories.map((category) => (
                                        <div key={category.sp_сategorie_id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="font-medium text-blue-900">{category.name}</div>
                                            {category.count_business > 0 && (
                                                <div className="text-sm text-blue-600 mt-1">
                                                    {category.count_business} клиник
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Business Info */}
                        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Информация о клинике</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Building2 className="w-4 h-4 text-gray-400" />
                                    <span>ИНН: {business.inn}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span>Рабочие часы: {business.begin_time} - {business.end_time}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Method Selector Modal */}
            {showMethodSelector && (
                <ReservationMethodSelector
                    onMethodSelect={handleMethodSelect}
                    onClose={() => setShowMethodSelector(false)}
                />
            )}

            {/* SMS Login Modal */}
            {showSmsLogin && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <SmsLoginForm
                        onLoginSuccess={handleSmsLoginSuccess}
                        onBack={handleBackToMethodSelector}
                    />
                </div>
            )}

            {/* Reservation Modal */}
            {showReservationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">
                                {userAccessToken ? 'Подтверждение записи' : 'Запись к врачу'}
                            </h3>
                            <button
                                onClick={() => setShowReservationModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* User Login Status */}
                        {userAccessToken && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center gap-2 text-green-800">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">
                                        Добро пожаловать, {localStorage.getItem('user_first_name') || 'Пользователь'}! 
                                        {localStorage.getItem('user_last_name') && ` ${localStorage.getItem('user_last_name')}`}
                                    </span>
                                </div>
                            </div>
                        )}

                        {selectedDoctor && selectedSlot && (
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    <strong>Врач:</strong> {selectedDoctor.last_name} {selectedDoctor.first_name} {selectedDoctor.patronymic}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <strong>Дата и время:</strong> {selectedSlot.date} в {selectedSlot.time}
                                </p>
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Show user info if authenticated */}
                            {userAccessToken ? (
                                <div className="space-y-3">
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            <strong>Имя:</strong> {reservationForm.firstName} {reservationForm.lastName} {reservationForm.patronymic}
                                        </p>
                                        <p className="text-sm text-blue-800">
                                            <strong>Телефон:</strong> {reservationForm.phoneNumber}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Имя *</label>
                                        <input
                                            type="text"
                                            value={reservationForm.firstName}
                                            onChange={(e) => setReservationForm(prev => ({ ...prev, firstName: e.target.value }))}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                                            placeholder="Введите имя"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Фамилия *</label>
                                        <input
                                            type="text"
                                            value={reservationForm.lastName}
                                            onChange={(e) => setReservationForm(prev => ({ ...prev, lastName: e.target.value }))}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                                            placeholder="Введите фамилию"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Отчество</label>
                                        <input
                                            type="text"
                                            value={reservationForm.patronymic}
                                            onChange={(e) => setReservationForm(prev => ({ ...prev, patronymic: e.target.value }))}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                                            placeholder="Введите отчество (необязательно)"
                                        />
                                    </div>

                                    <PhoneInput
                                        value={reservationForm.phoneNumber}
                                        onChange={(value) => setReservationForm(prev => ({ ...prev, phoneNumber: value }))}
                                        label="Номер телефона"
                                        required={true}
                                        placeholder="998 99 123 45 67"
                                    />
                                </>
                            )}

                            {userAccessToken ? (
                                // For authenticated users, show direct confirmation button
                                <button
                                    onClick={confirmReservation}
                                    disabled={loadingReservation}
                                    className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
                                >
                                    {loadingReservation ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Подтвердить запись'}
                                </button>
                            ) : !smsSent ? (
                                <button
                                    onClick={sendSMS}
                                    disabled={loadingReservation || !reservationForm.phoneNumber}
                                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                                >
                                    {loadingReservation ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Отправить SMS код'}
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    {/* SMS Success Message */}
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-green-800">
                                            <CheckCircle className="w-5 h-5" />
                                            <span className="text-sm font-medium">
                                                SMS код отправлен на номер {userAccessToken ? localStorage.getItem('phone_number') : reservationForm.phoneNumber}
                                            </span>
                                        </div>
                                        <p className="text-xs text-green-600 mt-1">Проверьте SMS сообщение и введите код ниже</p>
                                        {smsPassword && (
                                            <div className="mt-2 p-2 bg-white border border-green-300 rounded text-center">
                                                <p className="text-xs text-green-700 font-medium">Полученный код:</p>
                                                <p className="text-lg font-bold text-green-800">{smsPassword}</p>
                                                <p className="text-xs text-green-600">(для тестирования)</p>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">SMS код *</label>
                                        <input
                                            type="text"
                                            value={reservationForm.smsCode}
                                            onChange={(e) => setReservationForm(prev => ({ ...prev, smsCode: e.target.value }))}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                                            placeholder="Введите код из SMS"
                                            required
                                        />
                                    </div>

                                    <button
                                        onClick={confirmReservation}
                                        disabled={loadingReservation || !reservationForm.smsCode}
                                        className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
                                    >
                                        {loadingReservation ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (userAccessToken ? 'Подтвердить запись' : 'Подтвердить запись')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Modal */}
            <NotificationModal
                isOpen={notification.isOpen}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
                autoClose={true}
                autoCloseDelay={5000}
                showCloseButton={true}
            />
        </div>
    );
}