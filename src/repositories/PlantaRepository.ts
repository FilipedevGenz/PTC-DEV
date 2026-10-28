import {Prisma} from "@prisma/client";
import prisma from "@database";

export const createPlanta = async (data: Prisma.PlantaCreateInput) => {
    return await prisma.planta.create({
        data: data,
    });
};

export const findAllPlantas = async () => {
    return await prisma.planta.findMany();
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

export const updateEstoquePlanta = async (id: number, amount: number) => {
    return await prisma.planta.update({
        where: { id: id },
        data:{
            estoque: {increment: amount}
        }
    });
}

export const updatePlanta = async (id: number, data: Prisma.PlantaUpdateInput) => {
    return await prisma.planta.update({
        where: { id: id },
        data: data,
    });
};

export const deletePlanta = async (id: number) => {
    return await prisma.planta.delete({
        where: { id: id }
    });
};
