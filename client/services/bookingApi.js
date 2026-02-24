
export const searchVehicles = async (params) => {
    return {
        success: true,
        data: [
            {
                _id: '1',
                title: 'Toyota Prius',
                make: 'Toyota',
                model: 'Prius',
                licensePlate: 'ABC-1234',
                amount: 5000,
                pricePerDay: 5000,
                image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            },
            {
                _id: '2',
                title: 'Honda Civic',
                make: 'Honda',
                model: 'Civic',
                licensePlate: 'XYZ-5678',
                amount: 6000,
                pricePerDay: 6000,
                image: 'https://images.unsplash.com/photo-1503376763036-066120622c74?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            },
        ]
    };
};

export const createBooking = async (formData) => {
    console.log('Booking created:', formData);
    return { success: true };
};
