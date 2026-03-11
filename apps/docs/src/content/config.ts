import { defineCollection, z } from 'astro:content';

/**
 * Schéma d'une variante de composant.
 * Chaque variante correspond à un état / une configuration pré-définie du composant.
 */
const variantSchema = z.object({
    /** Nom affiché dans la navigation des variantes */
    name: z.string(),
    /** Description courte affichée sous le nom */
    description: z.string().optional(),
    /** HTML brut injecté dans le playground pour cette variante */
    html: z.string(),
});

/**
 * Collection "components" — un fichier MDX par composant.
 * Le frontmatter définit les métadonnées et les variantes pré-configurées.
 */
const components = defineCollection({
    type: 'content',
    schema: z.object({
        /** Tag name du composant (ex: mr-button) */
        tagName: z.string(),
        /** Titre affiché en haut de la page */
        title: z.string(),
        /** Description courte affichée sous le titre */
        description: z.string().optional(),
        /** Nom du tag du composant parent */
        parent: z.string().optional(),
        /** Variantes pré-configurées affichées dans le playground */
        // variants: z.array(variantSchema).default([]),
        // coerce : si le champ est absent ou null dans le MDX, on force un array vide
        variants: z.preprocess((val) => (Array.isArray(val) ? val : []), z.array(variantSchema)),
    }),
});

export const collections = { components };
