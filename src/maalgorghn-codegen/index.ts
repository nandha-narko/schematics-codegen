import { basename, dirname, normalize, relative, strings } from '@angular-devkit/core';
import {
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
  apply,
  chain,
  mergeWith,
  branchAndMerge,
  // schematic,
  template,
  url,
  move,
  filter,
  noop,
  MergeStrategy
} from '@angular-devkit/schematics';
import { addImportToModule } from '../utility/ast-utils';
import { InsertChange } from '../utility/change';
// import { findModuleFromOptions } from '../utility/find-module';
import * as ts from 'typescript';

const appTemplate = `
<finx-loading-bar [color]="'#76BB25'" [height]="'4px'"></finx-loading-bar>
<finx-header></finx-header>
<router-outlet></router-outlet>
<finx-footer></finx-footer>
`;


// function importRateQuoteInAppModule(options: any): Rule {
//   return (host: Tree) => {
//     const modulePath = normalize('/' + options.sourceDir + '/' + options.appRoot + '/app.module.ts');

//     const text = host.read(modulePath);

//     if (text === null) {
//       throw new SchematicsException(`File ${modulePath} does not exist.`);
//     }
//     const sourceText = text.toString('utf-8');
//     const source = ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);
//     const importModulePath = normalize(
//       `/${options.sourceDir}/${options.appRoot}/`
//       + ('rate-quote/rate-quote.module')
//     );


//     const relativeDir = relative(dirname(modulePath), dirname(importModulePath));
//     const relativePath = (relativeDir.startsWith('.') ? relativeDir : './' + relativeDir)
//       + '/' + basename(importModulePath);
//     const changes = addImportToModule(source, modulePath,
//       strings.classify(`RateQuoteModule`),
//       relativePath);

//     const recorder = host.beginUpdate(modulePath);
//     for (const change of changes) {
//       if (change instanceof InsertChange) {
//         recorder.insertLeft(change.pos, change.toAdd);
//       }
//     }
//     host.commitUpdate(recorder);

//     return host;
//   }
// }

function importAppRouteModuleInAppModule(options: any): Rule {
  return (host: Tree) => {

    const modulePath = normalize('/' + options.sourceDir + '/' + options.appRoot + '/app.module.ts');

    console.log(modulePath);

    const text = host.read(modulePath);

    if (text === null) {
      throw new SchematicsException(`File ${modulePath} does not exist.`);
    }
    const sourceText = text.toString('utf-8');
    const source = ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);
    const importModulePath = normalize(
      `/${options.sourceDir}/${options.appRoot}/app-routing.module`
    );

    const relativeDir = relative(dirname(modulePath), dirname(importModulePath));
    const relativePath = (relativeDir.startsWith('.') ? relativeDir : './' + relativeDir)
      + basename(importModulePath);

    const changes = addImportToModule(source, modulePath,
      strings.classify(`AppRoutingModule`),
      relativePath);

    const recorder = host.beginUpdate(modulePath);
    for (const change of changes) {
      if (change instanceof InsertChange) {
        recorder.insertLeft(change.pos, change.toAdd);
      }
    }
    host.commitUpdate(recorder);

    return host;
  }
}

function importCoreInAppModule(options: any): Rule {
  return (host: Tree) => {
    const modulePath = normalize('/' + options.sourceDir + '/' + options.appRoot + '/app.module.ts');

    const text = host.read(modulePath);

    if (text === null) {
      throw new SchematicsException(`File ${modulePath} does not exist.`);
    }
    const sourceText = text.toString('utf-8');
    const source = ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);

    const changes = addImportToModule(source, modulePath, 'CoreModule', 'maalgorghn');
    const recorder = host.beginUpdate(modulePath);
    changes.forEach((change: InsertChange) => {
      recorder.insertLeft(change.pos, change.toAdd);
    });
    host.commitUpdate(recorder);

    return host;
  }
}

function importBrowserAnimationsModuleInAppModule(options: any): Rule {
  return (host: Tree) => {
    const modulePath = normalize('/' + options.sourceDir + '/' + options.appRoot + '/app.module.ts');

    const text = host.read(modulePath);

    if (text === null) {
      throw new SchematicsException(`File ${modulePath} does not exist.`);
    }
    const sourceText = text.toString('utf-8');
    const source = ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);

    const changes = addImportToModule(source, modulePath, 'BrowserAnimationsModule', '@angular/platform-browser/animations');
    const recorder = host.beginUpdate(modulePath);
    changes.forEach((change: InsertChange) => {
      recorder.insertLeft(change.pos, change.toAdd);
    });
    host.commitUpdate(recorder);

    return host;
  }
}

type PackageJsonPartialType = {
  scripts: {
    [key: string]: string;
  },
  dependencies: {
    [key: string]: string;
  },
  devDependencies: {
    [key: string]: string;
  },
};

interface UpdateJsonFn<T> {
  (obj: T): T | void;
}

function updateJsonFile<T>(host: Tree, path: string, callback: UpdateJsonFn<T>): Tree {
  const source = host.read(path);
  if (source) {
    const sourceText = source.toString('utf-8');
    const json = JSON.parse(sourceText);
    callback(json);
    host.overwrite(path, JSON.stringify(json, null, 2));
  }

  return host;
}

function addDependenciesToPackageJson() {

  return (host: Tree) => {
    if (!host.exists('package.json')) { return host; }

    return updateJsonFile(host, 'package.json', (json: PackageJsonPartialType) => {


      if (!json['dependencies']) {
        json['dependencies'] = {};
      }

      json.dependencies = {
        ...json.dependencies,
        'maalgorghn': '^0.0.13',
        'bootstrap': '^4.0.0',
        '@angular/material':'^5.2.4'
      };

      if (!json['devDependencies']) {
        json['devDependencies'] = {};
      }

      json.devDependencies = {
        // De-structure last keeps existing user dependencies.
        ...json.devDependencies,
      };
    });
  };
}

type AngularCliJsonPartialType = {
  apps: [{
    styles: string[]
  }]
};

function addStylesImport() {

  return (host: Tree) => {
    if (!host.exists('.angular-cli.json')) { return host; }

    return updateJsonFile(host, '.angular-cli.json', (json: AngularCliJsonPartialType) => {

      if(json['apps']) {
        json.apps[0].styles.push(
          '../node_modules/maalgorghn/assets/styles/maalgorghn.scss',
          '../node_modules/bootstrap/dist/css/bootstrap.min.css'
        );
      }
    });
  };
}

function updateAppComponent(options: any) {
  return (host: Tree) => {
      host.overwrite(`/${options.sourceDir}/${options.appRoot}/` + 'app.component.html', appTemplate);
    return host;
  };
}


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function maalgorghnCodegen(options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    options.path = options.path ? normalize(options.path) : options.path;
    // options.module = options.module || findModuleFromOptions(host, options) || '';   

    const templateSource = apply(url('./files'), [
      template({
        ...options
      }),
      move(`/${options.sourceDir}/${options.appRoot}/`)
    ]);

    const routingTemplateSource = apply(url('./other-files'), [
      template({
        ...options
      }),
      move(`/${options.sourceDir}/${options.appRoot}/`),
      filter(path => path.includes('app-routing'))
    ]);

    const dataTemplateSource = apply(url('./other-files'), [
      template({
        ...options
      }),
      move(`/${options.sourceDir}/assets/`),
      filter(path => path.includes('data'))
    ]);

    const rule = chain([
      branchAndMerge(chain([
        mergeWith(templateSource),
        mergeWith(dataTemplateSource),
        tree.exists(`/${options.sourceDir}/${options.appRoot}/app-routing.module.ts`) ? noop() : mergeWith(routingTemplateSource),
        addDependenciesToPackageJson(),
        importBrowserAnimationsModuleInAppModule(options),
        importCoreInAppModule(options),
        tree.exists(`/${options.sourceDir}/${options.appRoot}/app-routing.module.ts`) ? noop() : importAppRouteModuleInAppModule(options),
        addStylesImport(),
        updateAppComponent(options)
      ]), MergeStrategy.AllowOverwriteConflict),
    ]);

    return rule(tree, _context);
  };
}