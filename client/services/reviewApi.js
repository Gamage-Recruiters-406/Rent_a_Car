
export const getAllReviews = async () => {
    return [
        {
            id: 1,
            name: 'John Doe',
            profession: 'Software Engineer',
            rating: 5,
            quote: 'Great service! Highly recommended.',
            image: 'https://randomuser.me/api/portraits/men/1.jpg',
        },
        {
            id: 2,
            name: 'Jane Smith',
            profession: 'Designer',
            rating: 4,
            quote: 'Good car, smooth process.',
            image: 'https://randomuser.me/api/portraits/women/2.jpg',
        },
    ];
};
