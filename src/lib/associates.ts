
export interface Associate {
    id: string;
    name: string;
    description: string;
    logo: string;
}

export const associates: Associate[] = [
    {
        id: "big-mike-cumming",
        name: "Big Mike Cumming",
        description: "A key figure in the entertainment sphere, known for his larger-than-life personality and bold ventures.",
        logo: "https://firebasestorage.googleapis.com/v0/b/studio-3687522943-485ca.firebasestorage.app/o/BMC.png?alt=media&token=2227d77d-cd2b-467c-9476-6f6df504999f"
    },
    {
        id: "wojaplers",
        name: "Wojaplers",
        description: "An innovative content creator group, famous for their unique blend of comedy and technology.",
        logo: "https://firebasestorage.googleapis.com/v0/b/studio-3687522943-485ca.firebasestorage.app/o/Wojap.jpg?alt=media&token=c2f6b33a-dca6-4aaf-9c23-d8c1183c5af0"
    },
    {
        id: "ball-hair-pranks",
        name: "Ball Hair Pranks",
        description: "A notorious prank collective that pushes the boundaries of humor and public performance.",
        logo: "https://firebasestorage.googleapis.com/v0/b/studio-3687522943-485ca.firebasestorage.app/o/BHP.jpg?alt=media&token=d40e60e1-08ca-4e8c-900c-f2b266950c16"
    },
    {
        id: "salmon-skin",
        name: "Salmon Skin",
        description: "An enigmatic artist known for their surreal and thought-provoking contributions to the entertainment world.",
        logo: "https://firebasestorage.googleapis.com/v0/b/studio-3687522943-485ca.firebasestorage.app/o/Salmon%20Skin.jpg?alt=media&token=4f8b5f55-d533-408e-a2de-0bc10385cee4"
    },
    {
        id: "buttloader",
        name: "ButtLoader",
        description: "A mysterious entity known for their powerful content delivery systems.",
        logo: "https://firebasestorage.googleapis.com/v0/b/studio-3687522943-485ca.firebasestorage.app/o/profile-pictures%2FGemini_Generated_Image_7icc87icc87icc87.png?alt=media&token=40d6a247-cde0-4762-a456-5d6620e49568"
    }
];

export const getAssociateById = (id: string) => {
    return associates.find(a => a.id === id);
}
