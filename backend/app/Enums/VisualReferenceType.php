<?php

namespace App\Enums;

enum VisualReferenceType: string
{
    case Diagram = 'diagram';
    case Table = 'table';
    case Graph = 'graph';
    case ChemicalStructure = 'chemical_structure';
    case Image = 'image';
    case Mixed = 'mixed';
}
