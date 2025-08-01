// lib/api.ts
import axios from 'axios';

export const fetchBusinesses = async () => {
    const res = await axios.post('http://texnoxizmat.uz:8082/ru/GetBusiness', {
        parameters: { parent_business_id: 0 },
        offset: 0,
        limit: 2,
        orderBy: 'ASC',
    }, {
        headers: {
            'api-key': 'b463026f-f02a-483e-9750-4c3890474604',
            'Content-Type': 'application/json',
        },
    });
    return res.data?.data || [];
};
