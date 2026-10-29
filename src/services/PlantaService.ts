import * as PlantaRepository from "../repositories/PlantaRepository"
import { logger } from "../infra/Logger"
import {Planta, Prisma} from "@prisma/client";
import {Result, PlantaErrors, err, ok} from "../types/type"
import prisma from "@database";

export const createPlanta = async (planta:Prisma.PlantaCreateInput): Promise<Result<Planta,PlantaErrors>> => {
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

export const getPlanta = async (id: number): Promise<Result<Planta,PlantaErrors>> => {
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
        logger.error("Error creating Planta: ", error);
        throw error;
    }
}

export const updatePlanta = async (id: number, planta: Planta): Promise<Result<Planta,PlantaErrors>>  => {
    try {
        logger.info("trying to update Planta");
        const count = await PlantaRepository.updatePlanta(id, planta);
        const toReturn = await PlantaRepository.findPlantaById(id)
        if (count.count === 0 || !toReturn) {
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

export const deletePlanta = async (id: number): Promise<Result<null,PlantaErrors>>  => {
    try {
        logger.info("trying to delete Planta");
        const count = await PlantaRepository.deletePlanta(id);
        if (count.count === 0) {
            logger.error("Could not find Planta with this Id: " + id);
            return err("NOT_FOUND");
        }
        return ok(null);
    }
    catch (error) {
        logger.error("Error deleting Planta:", error);
        throw error;
    }
}

export const updateEstoque = async (id: number, amount: number): Promise<Result<Planta,PlantaErrors>> => {
    try {
        logger.info("trying to update Estoque");
        const planta = await PlantaRepository.findPlantaById(id)
        if (planta && planta.estoque - amount < 0) {
            logger.error("Could not subtract stock");
            return err("INSUFFICIENT_STOCK");
        }
        const updatedPlanta = await PlantaRepository.updateEstoquePlanta(id, amount);
        if (updatedPlanta === null) {
            logger.error("Could not find a Planta with this Id " + id);
            return err("NOT_FOUND")
        }
        logger.info("Could update Estoque");
        return ok(updatedPlanta);
    }
    catch (error) {
        logger.error("Error updating Estoque:", error);
        throw error;
    }
}

export const getAllValue = async ()=>{
    try {
        logger.info("trying to get all values");
        return PlantaRepository.getValorTotalEstoque();
    }
    catch (error) {
        logger.error("Error deleting Planta");
        throw error;
    }
}