import { DataPoolService } from "src/app/shared/services/data-pool/data-pool.service";
import { Injectable } from "@angular/core";
import { AllSelectdataService, SRC_DATA } from "src/app/core/services/db/selectdata/all_selectdata.service";
import { element } from "protractor";

type TSelect = Array<{ text: string; value: number | string }>;

@Injectable({
  providedIn: "root",
})
export class QuotationConfig {
  sentence;
  vehicleFamilyList = [];

  vehicleBrandList = [];

  usedYrList = [];

  vehicleTypeList = [];

  carPwrKdList = [];

  maxLoadList = [];

  usedYearList = [];

  defaultMaxLoadList = [];

  defaultCarPwrKdList = [];

  insurancePeriodList: TSelect = [];

  carPhysicalDeclarationPageList: TSelect = [];

  additionalTermsList: TSelect = [];

  discRateAdditList: TSelect = [];

  ddcbAmtList: TSelect = [];

  passengerAmtList: TSelect = [];

  constructor(private allSelectDataService: AllSelectdataService, private dataPoolService: DataPoolService) {
    const { quotation } = this.dataPoolService.gLang;
    this.sentence = {
      quotation,
    };
    this.initializeLists();
    this.setupLists();
    this.setupDefaultLists();
    this.usedYearList = this.getUsedYearList(1900);
  }

  private initializeLists(): void {
    this.usedYrList = this.getListYears(15);
    this.vehicleFamilyList = this.geVehicleFamilyList();
    this.vehicleBrandList = this.getVehicleBrandList();
  }

  private getListYears(yearsToInclude: number = 100): Array<{ text: string; value: string }> {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - yearsToInclude;
    return Array.from({ length: yearsToInclude + 1 }, (_, i) => {
      const year = currentYear - i;
      return { text: year.toString(), value: year.toString() };
    });
  }

  getUsedYearList(yearUsedYr) {
    // const currentYear = new Date().getFullYear();
    // const usedEnd = Number(currentYear) - Number(yearUsedYr);
    // const yearsList = [];
    // for (let step = 1; step <= usedEnd; step++) {
    //   const stepStr = step.toString();
    //   yearsList.push({ text: `${stepStr} ${this.sentence.quotation.select_list.sl00005}`, value: stepStr });
    // }
    const yearsList = [
      { text: "Dưới 3 năm", value: "2" },
      { text: "Từ 03 đến dưới 6 năm", value: "5" },
      { text: "Từ 06 đến 10 năm", value: "7" },
      { text: "Từ 10 đến dưới 15 năm", value: "12" },
    ];
    return yearsList;
  }

  private setupInsurancePeriodList(): TSelect {
    return [
      { text: "1 năm", value: 1 },
      { text: "2 năm", value: 2 },
      { text: "3 năm", value: 3 },
    ];
  }

  private setupLists(): void {
    this.vehicleTypeList = this.allSelectDataService.allSelectdata.vechicleKdCarList
      .filter((item) => [21, 22, 31, 41, 42].includes(item.seqNo))
      .map((item) => ({
        ...item,
        ...this.getLocalizedNames(item.zhName || "", item.vnName || "", item.vechicleKdValue),
      }));
    this.carPwrKdList = this.allSelectDataService.allSelectdata.vehicleUseCarList.map((item) => ({
      ...item,
      ...this.getLocalizedNames(item.zhName || "", item.vnName || "", item.carPwrKdValue),
    }));
    this.maxLoadList = this.allSelectDataService.allSelectdata.loadList.map((item) => ({
      ...item,
      ...this.getLocalizedNames(item.zhName || "", item.vnName || "", item.loadValue),
    }));
    this.insurancePeriodList = this.setupInsurancePeriodList();
    this.carPhysicalDeclarationPageList = this.setupCarPhysicalDeclarationPageList();
    this.additionalTermsList = this.additionalTermsListData();
    this.discRateAdditList = this.getDiscRateAdditList(0, 70, 10);
    this.ddcbAmtList = this.setupDdcbAmtList(1000000, 7000000, 1000000);
    this.passengerAmtList = this.getPassengerAmtList(10000000, 200000000, 10000000);
  }

  private getLocalizedNames(
    zhName: string,
    vnName: string,
    value: string | number
  ): { text: string; value: string | number } {
    const text = this.dataPoolService.gLangType === "zh-TW" ? zhName : vnName;
    return { text, value };
  }

  private setupDefaultLists(): void {
    this.defaultMaxLoadList = this.maxLoadList.slice();
    this.defaultCarPwrKdList = this.carPwrKdList.slice();
  }

  private setupCarPhysicalDeclarationPageList(): TSelect {
    return [
      { text: this.sentence.quotation.select_list.sl00001, value: "1" },
      { text: this.sentence.quotation.select_list.sl00002, value: "2" },
      { text: this.sentence.quotation.select_list.sl00003, value: "3" },
      { text: this.sentence.quotation.select_list.sl00004, value: "4" },
    ];
  }

  private additionalTermsListData(): TSelect {
    return Array.from({ length: 12 }, (_, i) => {
      const value = i + 1;
      return { text: this.sentence.quotation.step[`sp000${49 + i}`], value };
    });
  }

  private getDiscRateAdditList(min: number, max: number, step: number): TSelect {
    return Array.from({ length: Math.ceil(((max - min) / step) + 1) }, (_, i) => {
      const value = min + i * step;
      return { text: `${value}%`, value: value.toString() };
    });
  }

  setupDdcbAmtList(min: number, max: number, step: number): TSelect {
    return Array.from({ length: Math.ceil(((max - min) / step) + 1) }, (_, i) => {
      const value = min + i * step;
      return { text: value.toLocaleString("vi-VN") + " VND", value: value.toString() };
    });
  }

  private getPassengerAmtList(min: number, max: number, step: number): TSelect {
    return Array.from({ length: Math.ceil(((max - min) / step) + 1) }, (_, i) => {
      const value = min + i * step;
      return { text: value.toLocaleString("vi-VN"), value: value.toString() };
    });
  }

  isAdditionalTerms(valueTerm: number, data: TSelect): boolean {
    return data?.some((item) => item.value === valueTerm);
  }

  handleIsBSAmt(termValue, value) {
    return this.isAdditionalTerms(termValue, value);
  }

  private geVehicleFamilyList() {
    return this.allSelectDataService.allSelectdata.vehicleFamilyList
      .map((item) => {
        return {
          ...item,
          text: this.dataPoolService.gLangType === "zh-TW" ? `${item.zhName || ""}` : `${item.vnName || ""}`,
          value: item.vehicleFamilyValue,
        };
      })
      .filter((e) => {
        const isAIC = e.srcData.trim() === SRC_DATA.AIC;
        const isShow = e.isShow === "Y";
        return isAIC && isShow;
      });
  }
  private getVehicleBrandList() {
    return this.allSelectDataService.allSelectdata.vehicleBrandList
      .map((item) => {
        return {
          ...item,
          text: this.dataPoolService.gLangType === "zh-TW" ? `${item.zhName || ""}` : `${item.vnName || ""}`,
          value: item.vechicleBrandValue,
        };
      })
      .filter((e) => {
        const isAIC = e.srcData.trim() === SRC_DATA.AIC;
        const isShow = e.isShow === "Y";
        return isAIC && isShow;
      });
  }
}
