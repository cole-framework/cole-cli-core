import { ComponentData } from "../types";
import { ClassTemplateModel } from "./class.template-model";
import { ExportTemplateModel } from "./export.template-model";
import { FunctionTemplateModel } from "./function.template-model";
import { ImportTemplateModel } from "./import.template-model";
import { InterfaceTemplateModel } from "./interface.template-model";
import { MethodTemplateModel } from "./method.template-model";
import { ParamTemplateModel } from "./param.template-model";
import { PropTemplateModel } from "./prop.template-model";
import { TestCaseTemplateModel } from "./test-case.template-model";
import { TestSuiteTemplateModel } from "./test-suite.template-model";
import { TypeTemplateModel } from "./type.template-model";

export type FileTemplateContent = {
  exports: ExportTemplateModel[];
  imports: ImportTemplateModel[];
  types: TypeTemplateModel[];
  functions: FunctionTemplateModel[];
  classes: ClassTemplateModel[];
  interfaces: InterfaceTemplateModel[];
  test_suites: TestSuiteTemplateModel[];
};

export class FileTemplateModel {
  public readonly content: FileTemplateContent = {
    exports: [],
    imports: [],
    types: [],
    functions: [],
    classes: [],
    interfaces: [],
    test_suites: [],
  };

  constructor(
    public readonly path: string,
    public readonly write_method: string,
    content?: {
      exports?: ExportTemplateModel[];
      imports?: ImportTemplateModel[];
      types?: TypeTemplateModel[];
      functions?: FunctionTemplateModel[];
      classes?: ClassTemplateModel[];
      interfaces?: InterfaceTemplateModel[];
      test_suites?: TestSuiteTemplateModel[];
    }
  ) {
    if (content) {
      this.content.classes = content.classes || [];
      this.content.functions = content.functions || [];
      this.content.types = content.types || [];
      this.content.imports = content.imports || [];
      this.content.interfaces = content.interfaces || [];
      this.content.exports = content.exports || [];
      this.content.test_suites = content.test_suites || [];
    }
  }

  update(data: ComponentData) {
    const {
      content: { imports, types, functions, classes, interfaces, test_suites },
    } = this;

    if (Array.isArray(data.element.imports)) {
      data.element.imports.forEach((newImport) => {
        const impt = imports.find((imp) => imp.path === newImport.path);
        if (impt) {
          newImport.list.forEach((item) => {
            if (impt.list.indexOf(item) === -1) {
              impt.list.push(item);
            }
          });

          if (newImport.alias) {
            impt.alias = newImport.alias;
          }

          if (newImport.dflt) {
            impt.dflt = newImport.dflt;
          }
        } else {
          imports.push(ImportTemplateModel.create(newImport));
        }
      });
    }

    if (Array.isArray(data.dependencies)) {
      data.dependencies.forEach((dependency) => {
        if (dependency.path !== data.path) {
          // add import
        }
      });
    }

    if (Array.isArray(data.element.functions)) {
      data.element.functions.forEach((newFn) => {
        const fn = functions.find((f) => f.name === newFn.name);

        if (fn) {
          newFn.params.forEach((item) => {
            if (
              fn.params.findIndex((param) => param.name === item.name) === -1
            ) {
              fn.params.push(ParamTemplateModel.create(item));
            }
          });
        } else {
          functions.push(FunctionTemplateModel.create(newFn));
        }
      });
    }

    if (data.type.isModel || data.type.isRouteModel) {
      const type = types.find((i) => i.name === data.element.name);

      if (type) {
        data.element.props.forEach((item) => {
          if (type.props.findIndex((prop) => prop.name === item.name) === -1) {
            type.props.push(PropTemplateModel.create(item));
          }
        });
      } else {
        types.push(TypeTemplateModel.create(data.element));
      }
    } else if (data.type.isInterface) {
      const intf = interfaces.find((i) => i.name === data.element.name);

      if (intf) {
        data.element.props.forEach((item) => {
          if (intf.props.findIndex((prop) => prop.name === item.name) === -1) {
            intf.props.push(PropTemplateModel.create(item));
          }
        });
        data.element.methods.forEach((item) => {
          if (intf.methods.findIndex((mth) => mth.name === item.name) === -1) {
            intf.methods.push(MethodTemplateModel.create(item));
          }
        });
      } else {
        interfaces.push(InterfaceTemplateModel.create(data.element));
      }
      //TODO: temp sol --- before adding isClass
      return;
    } else if (data.type.isTestSuite) {
      const suite = test_suites.find((i) => i.name === data.element.name);

      if (suite) {
        // update
        data.element.tests.forEach((item) => {
          if (suite.tests.findIndex((tst) => tst.name === item.name) === -1) {
            suite.tests.push(TestCaseTemplateModel.create(item));
          }
        });
      } else {
        test_suites.push(TestSuiteTemplateModel.create(data.element));
      }
    } else if (
      data.type.isComponentType &&
      !data.type.isModel &&
      !data.type.isRouteModel
    ) {
      const cls = classes.find((i) => i.name === data.element.name);

      if (cls) {
        data.element.props.forEach((item) => {
          if (cls.props.findIndex((prop) => prop.name === item.name) === -1) {
            cls.props.push(PropTemplateModel.create(item));
          }
        });
        data.element.methods.forEach((item) => {
          if (cls.methods.findIndex((mth) => mth.name === item.name) === -1) {
            cls.methods.push(MethodTemplateModel.create(item));
          }
        });
      } else {
        classes.push(ClassTemplateModel.create(data.element));
      }
    }
  }
}
