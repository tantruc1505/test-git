import { Injectable } from "@angular/core";
import { DataPoolService } from "src/app/shared/services/data-pool/data-pool.service";

export type TSelect = Array<{ text: string; value: number | string }>;

export const VEHICLE_TYPE_CARGO = "42";

export const LIST_HIDE_ADD_TERM = [3, 4, 5, 7 ,11, 12];

export enum PAY_OPTIONS {
  AGENT = "0",
  CUSTOMER = "1",
}

@Injectable({
  providedIn: "root",
})
export class QuotationConfig {
  sentence;
  PAY_OPTIONS = PAY_OPTIONS

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

  countriesList: any = []

  methodList: TSelect = [];

  language = this.dataPool.gLangType;

  allSelectData: any
  constructor(private dataPool: DataPoolService) {
    const { quotation , payment} = this.dataPool.gLang;
    this.sentence = {
      quotation,
      payment
    };
  }

  initializeLists(allSelectData: any): void {
    console.log("1.DATA SELECT C1")
    this.allSelectData = allSelectData;
    this.usedYrList = this.getListYears(15);
    this.vehicleFamilyList = this.geVehicleFamilyList();
    this.vehicleFamilyList.sort((a, b)=> a.text.localeCompare(b.text, undefined, { sensitivity: 'base' }));
    this.vehicleBrandList = this.getVehicleBrandList();
    this.vehicleBrandList.sort((a, b)=> a.text.localeCompare(b.text, undefined, { sensitivity: 'base' }));
    this.setupLists();
    this.setupDefaultLists();
    this.usedYearList = this.getUsedYearList(2000);
  }

  private getListYears(yearsToInclude: number = 100): Array<{ text: string; value: string }> {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - yearsToInclude;
    return Array.from({ length: yearsToInclude + 1 }, (_, i) => {
      const year = currentYear - i;
      return { text: year.toString(), value: year.toString() };
    }).sort((a, b) => +a.value - +b.value);
  }

  getUsedYearList() {

    const yearsList = [
      { text: this.sentence.quotation.select_list.sl00006 , value: "f00t03" },
      { text: this.sentence.quotation.select_list.sl00007, value: "f03to06" },
      { text: this.sentence.quotation.select_list.sl00008, value: "f06to10" },
      { text: this.sentence.quotation.select_list.sl00009, value: "f10to15" },
    ];
    return yearsList;
  }

  private setupInsurancePeriodList(): TSelect {
    return [
      { text: this.sentence.quotation.select_list.sl00010, value: 1 },
      { text: this.sentence.quotation.select_list.sl00012, value: 2 },
      { text: this.sentence.quotation.select_list.sl00012, value: 3 },
    ];
  }

  private setupLists(): void {
    this.vehicleTypeList = this.allSelectData.vechicleKdCarList
      .filter((item) => [21, 22, 31, 41, 42].includes(item.seqNo))
      .map((item) => ({
        ...item,
        ...this.getLocalizedNames(item.zhName || "", item.vnName || "", item.vechicleKdValue),
      }));
    this.carPwrKdList = this.allSelectData.vehicleUseCarList.map((item) => ({
      ...item,
      ...this.getLocalizedNames(item.zhName || "", item.vnName || "", item.carPwrKdValue),
    }));
    this.maxLoadList = this.allSelectData.loadList.map((item) => ({
      ...item,
      ...this.getLocalizedNames(item.zhName || "", item.vnName || "", item.loadValue),
    }));
    this.insurancePeriodList = this.setupInsurancePeriodList();
    this.carPhysicalDeclarationPageList = this.setupCarPhysicalDeclarationPageList();
    this.additionalTermsList = this.additionalTermsListData(12).filter(item => !LIST_HIDE_ADD_TERM.includes(+item.value));
    this.discRateAdditList = this.getDiscRateAdditList(0, 70, 10);
    this.ddcbAmtList = this.setupDdcbAmtList(1000000, 7000000, 1000000);
    this.passengerAmtList = this.getPassengerAmtList(10000000, 200000000, 10000000);
    this.countriesList = this.getCountiesList()
    this.methodList = this.getMethodList()
  }

  private getLocalizedNames(
    zhName: string,
    vnName: string,
    value: string | number
  ): { text: string; value: string | number } {
    const text = this.dataPool.gLangType === "zh-TW" ? zhName : vnName;
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

  private additionalTermsListData(quantityAdd: number): TSelect {
    return Array.from({ length: quantityAdd }, (_, i) => {
      const value = i + 1;
      return { text: this.sentence.quotation.add_term_list[`atl000${value.toString().length > 1 ? value : ('0' + value)}`], value };
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


  private getCountiesList() {
    return this.allSelectData.countyList.map((item) => {
      return {
        ...item,
        text:
          this.dataPool.gLangType === "zh-TW"
            ? `${item.countyZhname || ""}, ${item.provinceZhname || ""}`
            : `${item.countyVnname || ""}, ${item.provinceVnname || ""}`,
        value: String(item.id),
      };
    });
  }

  private getMethodList() {
    return [{ text: this.sentence.payment.p0001, value: PAY_OPTIONS.AGENT }, { text: this.sentence.payment.p0002, value: PAY_OPTIONS.CUSTOMER }]
  }

  isAdditionalTerms(valueTerm: number, data: TSelect): boolean {
    return data?.some((item) => item.value === valueTerm);
  }

  handleIsBSAmt(termValue, value) {
    return this.isAdditionalTerms(termValue, value);
  }

  private geVehicleFamilyList() {
    return this.allSelectData.vehicleFamilyList
      .map((item) => {
        return {
          ...item,
          text: this.dataPool.gLangType === "zh-TW" ? `${item.zhName || ""}` : `${item.vnName || ""}`,
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
    return this.allSelectData.vehicleBrandList
      .map((item) => {
        return {
          ...item,
          text: this.dataPool.gLangType === "zh-TW" ? `${item.zhName || ""}` : `${item.vnName || ""}`,
          value: item.vechicleBrandValue,
        };
      })
      .filter((e) => {
        const isAIC = e.srcData.trim() === SRC_DATA.AIC;
        const isShow = e.isShow === "Y";
        return isAIC && isShow;
      });
  }

  public pushToListIfMatch(msg: string, suffix: string): boolean {
    return msg.includes(suffix)
  }


  public blobToFile = (theBlob: Blob, fileName: string): File => {
    const b: any = theBlob;
    b.lastModifiedDate = new Date();
    b.name = fileName;
    return theBlob as File;
  }

  getListNameTerm(){
    return [
      this.sentence.quotation.detail.dt0065,
      this.sentence.quotation.detail.dt0066,
      this.sentence.quotation.detail.dt0067,
      this.sentence.quotation.detail.dt0068,
      this.sentence.quotation.detail.dt0069,
      this.sentence.quotation.detail.dt0070,
      this.sentence.quotation.detail.dt0071,
      this.sentence.quotation.detail.dt0072,
      this.sentence.quotation.detail.dt0073,
      this.sentence.quotation.detail.dt0074,
      this.sentence.quotation.detail.dt0075,
      this.sentence.quotation.detail.dt0076,
    ]
  }
}


export enum SRC_DATA  {
  AIC = 'AIC',
  CATHAY = 'CATHAY',
}
