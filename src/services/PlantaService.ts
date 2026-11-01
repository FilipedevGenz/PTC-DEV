import * as PlantaRepository from "../repositories/PlantaRepository"
import { logger } from "../infra/Logger"
import { Planta, Prisma } from "@prisma/client";
import { Result, PlantaErrors, err, ok } from "../types/type"

export const createPlanta = async (planta: Prisma.PlantaCreateInput): Promise<Result<Planta, PlantaErrors>> => {
    try {
        logger.info("Creating Planta");
        const toReturnPlanta = await PlantaRepository.createPlanta(planta);
        logger.info("Planta successfully created");
        return ok(toReturnPlanta);
    }
    catch (error) {
        logger.error("Error creating Planta:", error);
        throw error;
    }
}

export const getAllPlantas = async (
    where?: Prisma.PlantaWhereInput,
    orderBy?: Prisma.PlantaOrderByWithRelationInput
): Promise<Result<Planta[], PlantaErrors>> => {
    try {
        logger.info("trying to find all plantas");
        const plantas = await PlantaRepository.findAllPlantas(where, orderBy);
        logger.info("could find all plantas");
        return ok(plantas);
    }
    catch (error) {
        logger.error("Error finding all Plantas:", error);
        throw error;
    }
}

export const getPlanta = async (id: number): Promise<Result<Planta, PlantaErrors>> => {
    try {
        logger.info("trying to find planta");
        const toReturnPlanta = await PlantaRepository.findPlantaById(id)
        if (!toReturnPlanta) {
            logger.error("Could not find planta");
            return err("NOT_FOUND")
        }
        logger.info("Could find Planta")
        return ok(toReturnPlanta);
    }
    catch (error) {
        logger.error("Error finding Planta: ", error);
        throw error;
    }
}

export const updatePlanta = async (id: number, planta: Prisma.PlantaUpdateInput): Promise<Result<Planta, PlantaErrors>> => {
    try {
        logger.info("trying to update Planta");
        const existingPlanta = await PlantaRepository.findPlantaById(id);
        if (!existingPlanta) {
            logger.error("Could not find Planta");
            return err("NOT_FOUND");
        }
        await PlantaRepository.updatePlanta(id, planta);
        const toReturn = await PlantaRepository.findPlantaById(id);
        if (!toReturn) {
            logger.error("Could not find Planta");
            return err("NOT_FOUND");
        }
        logger.info("could update Planta");
        return ok(toReturn);
    }
    catch (error) {
        logger.error("Error updating Planta: ", error);
        throw error;
    }
}

export const deletePlanta = async (id: number): Promise<Result<null, PlantaErrors>> => {
    try {
        logger.info("trying to delete planta");
        const existingPlanta = await PlantaRepository.findPlantaById(id);
        if (!existingPlanta) {
            logger.error("Could not find Planta with this Id: " + id);
            return err("NOT_FOUND");
        }
        await PlantaRepository.deletePlanta(id);
        logger.info("could delete Planta");
        return ok(null);
    }
    catch (error) {
        logger.error("Error deleting Planta:", error);
        throw error;
    }
}

export const updateEstoque = async (id: number, quantidade: number): Promise<Result<Planta, PlantaErrors>> => {
    try {
        logger.info("trying to update Estoque");
        const updatedPlanta = await PlantaRepository.decrementEstoquePlanta(id, quantidade);
        if (updatedPlanta === null) {
            const planta = await PlantaRepository.findPlantaById(id);
            if (!planta) {
                logger.error("Could not find a Planta with this Id " + id);
                return err("NOT_FOUND")
            }
            logger.error("Could not subtract stock");
            return err("INSUFFICIENT_STOCK");
        }
        logger.info("Could update Estoque");
        return ok(updatedPlanta);
    }
    catch (error) {
        logger.error("Error updating Estoque:", error);
        throw error;
    }
}

export const getAllValue = async () => {
    try {
        logger.info("trying to get all values");
        return PlantaRepository.getValorTotalEstoque();
    }
    catch (error) {
        logger.error("Error getting all values:", error);
        throw error;
    }
}

export const getResumoEstoque = async (): Promise<Result<{ valorTotalEmCentavos: number; totalDeVasos: number }, PlantaErrors>> => {
    try {
        logger.info("trying to get stock summary");
        const plantas = await PlantaRepository.findAllPlantas();
        const resumo = plantas.reduce((acumulado, planta) => ({
                valorTotalEmCentavos: acumulado.valorTotalEmCentavos + planta.preco * planta.estoque,
                totalDeVasos: acumulado.totalDeVasos + planta.estoque,}),
                { valorTotalEmCentavos: 0, totalDeVasos: 0 }
        );
        logger.info("could get stock summary");
        return ok(resumo);
    }
    catch (error) {
        logger.error("Error getting stock summary:", error);
        throw error;
    }
}
