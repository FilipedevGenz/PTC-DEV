import { Prisma } from "@prisma/client";
import prisma from "@database";

export const createPlanta = async (data: Prisma.PlantaCreateInput) => {
    return await prisma.planta.create({
        data: data,
    });
};

export const findAllPlantas = async (
    where?: Prisma.PlantaWhereInput,
    orderBy?: Prisma.PlantaOrderByWithRelationInput
) => {
    return await prisma.planta.findMany({
        where: where,
        orderBy: orderBy,
    });
};

export const findPlantaById = async (id: number) => {
    return await prisma.planta.findUnique({
        where: { id: id }
    });
};

export const findPlantaByName = async (name: string) => {
    return await prisma.planta.findFirst({
        where: {
            nome: {
                equals: name,
                mode: "insensitive"
            }
        }
    });
};

export const decrementEstoquePlanta = async (id: number, amount: number) => {
    const result = await prisma.planta.updateMany({
        where: {
            id: id,
            estoque: { gte: amount },
        },
        data: {
            estoque: { decrement: amount }
        }
    });

    if (result.count === 0) return null;

    return await prisma.planta.findUnique({
        where: { id: id }
    });
};

export const updatePlanta = async (id: number, data: Prisma.PlantaUpdateInput) => {
    return await prisma.planta.updateMany({
        where: { id: id },
        data: data,
    });
};

export const deletePlanta = async (id: number) => {
    return await prisma.planta.deleteMany({
        where: { id: id }
    });
};

export const getValorTotalEstoque = async (): Promise<number> => {
    const plantas = await prisma.planta.findMany({
        select: { preco: true, estoque: true },
    });
    return plantas.reduce((somatorio, planta) => somatorio + planta.preco * planta.estoque, 0);
};
