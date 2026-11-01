import { Request, Response } from "express";
import { Luminosidade, Prisma } from "@prisma/client";
import * as PlantaService from "../services/PlantaService";
import { logger } from "../infra/Logger";
import { PlantaErrors } from "../types/type";

type CorpoPlanta = Record<string, unknown>;

const CAMPOS_OBRIGATORIOS = [
    "nome",
    "especie",
    "preco",
    "estoque",
    "luminosidade",
    "petFriendly",
    "regaACadaDias",
] as const;

const LUMINOSIDADES_VALIDAS: string[] = Object.values(Luminosidade);

const validarCampos = (body: CorpoPlanta, exigirTodos: boolean): string | null => {
    if (exigirTodos) {
        const faltando = CAMPOS_OBRIGATORIOS.filter((campo) => body[campo] === undefined);
        if (faltando.length > 0) {
            return "Preencha todos os campos: " + faltando.join(", ") + ".";
        }
    }
    const nome = body.nome;
    const especie = body.especie;
    const preco = body.preco;
    const estoque = body.estoque;
    const luminosidade = body.luminosidade;
    const petFriendly = body.petFriendly;
    const regaACadaDias = body.regaACadaDias;
    switch (true) {
        case nome !== undefined && (typeof nome !== "string" || nome.trim() === ""):
            return "O nome deve ser um texto não vazio.";
        case especie !== undefined && (typeof especie !== "string" || especie.trim() === ""):
            return "A espécie deve ser um texto não vazio.";
        case preco !== undefined && (typeof preco !== "number" || !Number.isInteger(preco) || preco <= 0):
            return "O preço deve ser um número inteiro maior que zero.";
        case estoque !== undefined && (typeof estoque !== "number" || !Number.isInteger(estoque) || estoque < 0):
            return "O estoque deve ser um número inteiro maior ou igual a zero.";
        case luminosidade !== undefined && !LUMINOSIDADES_VALIDAS.includes(luminosidade as string):
            return "Luminosidade inválida. Use " + LUMINOSIDADES_VALIDAS.join(", ") + ".";
        case petFriendly !== undefined && typeof petFriendly !== "boolean":
            return "petFriendly deve ser true ou false.";
        case regaACadaDias !== undefined && (typeof regaACadaDias !== "number" || !Number.isInteger(regaACadaDias) || regaACadaDias < 1):
            return "regaACadaDias deve ser um número inteiro maior ou igual a 1.";
        default:
            return null;
    }
};

const montarDadosPlanta = (body: CorpoPlanta): Prisma.PlantaUpdateInput => {
    const data: Prisma.PlantaUpdateInput = {};
    if (body.nome !== undefined) data.nome = body.nome as string;
    if (body.especie !== undefined) data.especie = body.especie as string;
    if (body.preco !== undefined) data.preco = body.preco as number;
    if (body.estoque !== undefined) data.estoque = body.estoque as number;
    if (body.luminosidade !== undefined) {
        data.luminosidade = body.luminosidade as Luminosidade;
    }
    if (body.petFriendly !== undefined) {
        data.petFriendly = body.petFriendly as boolean;
    }
    if (body.regaACadaDias !== undefined) {
        data.regaACadaDias = body.regaACadaDias as number;
    }
    return data;
};

const montarFiltros = (query: Request["query"]): Prisma.PlantaWhereInput => {
    const { luminosidade, petFriendly } = query;
    const where: Prisma.PlantaWhereInput = {};
    if (luminosidade !== undefined) {
        where.luminosidade = luminosidade as Luminosidade;
    }
    if (petFriendly !== undefined) {
        where.petFriendly = petFriendly === "true";
    }
    return where;
};

const lerId = (req: Request): number | null => {
    const id = Number(req.params.id);
    return Number.isInteger(id) && id > 0 ? id : null;
};

const erroPlanta = (res: Response, error: PlantaErrors) => {
    if (error === "NOT_FOUND") {
        return res.status(404).json({ message: "Planta não encontrada." });
    }
    return res.status(400).json({ message: "Estoque insuficiente." });
};

export const createPlanta = async (req: Request, res: Response) => {
    try {
        const body = (req.body ?? {}) as CorpoPlanta;
        const erro = validarCampos(body, true);
        if (erro) {
            return res.status(400).json({ message: erro });
        }
        const resultado = await PlantaService.createPlanta(montarDadosPlanta(body) as Prisma.PlantaCreateInput);
        if (!resultado.ok) {
            return erroPlanta(res, resultado.error);
        }
        return res.status(201).json(resultado.data);
    }
    catch (error) {
        logger.error("Error creating planta", error);
        return res.status(500).json({ message: "Erro ao cadastrar planta." });
    }
};

export const readAllPlantas = async (req: Request, res: Response) => {
    try {
        const { luminosidade, petFriendly } = req.query;
        switch (true) {
            case luminosidade !== undefined && (typeof luminosidade !== "string" || !LUMINOSIDADES_VALIDAS.includes(luminosidade)):
                return res.status(400).json({
                    message: "Luminosidade inválida. Use " + LUMINOSIDADES_VALIDAS.join(", ") + ".",
                });
            case petFriendly !== undefined && petFriendly !== "true" && petFriendly !== "false":
                return res.status(400).json({
                    message: "petFriendly deve ser true ou false.",
                });
        }
        const resultado = await PlantaService.getAllPlantas(montarFiltros(req.query));
        if (!resultado.ok) {
            return erroPlanta(res, resultado.error);
        }
        return res.status(200).json(resultado.data);
    }
    catch (error) {
        logger.error("Error reading plantas", error);
        return res.status(500).json({ message: "Erro ao buscar plantas." });
    }
};

export const readPlantasEsgotadas = async (req: Request, res: Response) => {
    try {
        const resultado = await PlantaService.getAllPlantas({ estoque: 0 });
        if (!resultado.ok) {
            return erroPlanta(res, resultado.error);
        }
        return res.status(200).json(resultado.data);
    }
    catch (error) {
        logger.error("Error reading esgotadas", error);
        return res.status(500).json({ message: "Erro ao buscar plantas esgotadas." });
    }
};

export const readPlantaById = async (req: Request, res: Response) => {
    try {
        const id = lerId(req);
        if (id === null) {
            return res.status(400).json({ message: "Id inválido." });
        }
        const resultado = await PlantaService.getPlanta(id);
        if (!resultado.ok) {
            return erroPlanta(res, resultado.error);
        }
        return res.status(200).json(resultado.data);
    }
    catch (error) {
        logger.error("Error reading planta", error, { id: req.params.id });
        return res.status(500).json({ message: "Erro ao buscar planta." });
    }
};

export const updatePlanta = async (req: Request, res: Response) => {
    try {
        const id = lerId(req);
        if (id === null) {
            return res.status(400).json({ message: "Id inválido." });
        }
        const plantaResult = await PlantaService.getPlanta(id);
        if (!plantaResult.ok) {
            return erroPlanta(res, plantaResult.error);
        }
        const body = (req.body ?? {}) as CorpoPlanta;
        const erro = validarCampos(body, false);
        if (erro) {
            return res.status(400).json({ message: erro });
        }
        const resultado = await PlantaService.updatePlanta(id, montarDadosPlanta(body));
        if (!resultado.ok) {
            return erroPlanta(res, resultado.error);
        }
        return res.status(200).json(resultado.data);
    }
    catch (error) {
        logger.error("Error updating planta", error, { id: req.params.id });
        return res.status(500).json({ message: "Erro ao atualizar planta." });
    }
};

export const deletePlanta = async (req: Request, res: Response) => {
    try {
        const id = lerId(req);
        if (id === null) {
            return res.status(400).json({ message: "Id inválido." });
        }
        const resultado = await PlantaService.deletePlanta(id);
        if (!resultado.ok) {
            return erroPlanta(res, resultado.error);
        }
        return res.status(204).send();
    }
    catch (error) {
        logger.error("Error deleting planta", error, { id: req.params.id });
        return res.status(500).json({ message: "Erro ao deletar planta." });
    }
};

export const venderPlanta = async (req: Request, res: Response) => {
    try {
        const id = lerId(req);
        if (id === null) {
            return res.status(400).json({ message: "Id inválido." });
        }
        const body = (req.body ?? {}) as CorpoPlanta;
        const quantidade = body.quantidade;
        if (typeof quantidade !== "number" || !Number.isInteger(quantidade) || quantidade <= 0) {
            return res.status(400).json({
                message: "A quantidade deve ser um número inteiro maior que zero.",
            });
        }
        const plantaResult = await PlantaService.getPlanta(id);
        if (!plantaResult.ok) {
            return erroPlanta(res, plantaResult.error);
        }
        if (plantaResult.data.estoque < quantidade) {
            return res.status(400).json({
                message: "Temos só " + plantaResult.data.estoque + " vasos em estoque.",
            });
        }
        const resultado = await PlantaService.updateEstoque(id, quantidade);
        if (!resultado.ok) {
            return erroPlanta(res, resultado.error);
        }
        return res.status(200).json(resultado.data);
    }
    catch (error) {
        logger.error("Error selling planta", error, { id: req.params.id });
        return res.status(500).json({ message: "Erro ao vender planta." });
    }
};

export const readValorTotalEstoque = async (req: Request, res: Response) => {
    try {
        const resultado = await PlantaService.getResumoEstoque();
        if (!resultado.ok) {
            return erroPlanta(res, resultado.error);
        }
        return res.status(200).json(resultado.data);
    }
    catch (error) {
        logger.error("Error calculating total stock value", error);
        return res.status(500).json({ message: "Erro ao calcular o valor total do estoque." });
    }
};
