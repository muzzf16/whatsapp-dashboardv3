import { Request, Response } from 'express';
import { TemplateModel } from '../models/Template';

export const createTemplate = async (req: Request, res: Response) => {
  try {
    const { name, content } = req.body;
    const template = new TemplateModel({ name, content });
    await template.save();
    res.status(201).json({ success: true, template });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await TemplateModel.find();
    res.status(200).json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, content } = req.body;
    const template = await TemplateModel.findByIdAndUpdate(id, { name, content }, { new: true });
    res.status(200).json({ success: true, template });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await TemplateModel.findByIdAndDelete(id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
