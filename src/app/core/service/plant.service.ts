import { Injectable } from '@angular/core';
import { CRUDService } from './crud.service';
import { BaseService } from './base.service';
import { APIConstant } from '../constants';
import { PlantRequest } from '../models/plant.model';
@Injectable({
  providedIn: 'root',
})
export class PlantService extends CRUDService<PlantRequest> {
  maxCount: number = Number.MAX_VALUE;

  constructor(protected override baseService: BaseService) {
    super(baseService, APIConstant.basePath);
  }

  getPlants(data: any, offset: number = 0, count: number = this.maxCount) {
    return this.add(APIConstant.getPlants(offset, count), data);
  }

  getPlantById(plantId: number) {
    return this.get(APIConstant.getPlantById(plantId));
  }

  updatePlant(interfaceId: string, data: any) {
    return this.update(APIConstant.updatePlant(interfaceId), data);
  }

  getPlantTypes() {
    return this.get(APIConstant.getPlantTypes);
  }
}
