import * as React from 'react';
import { inject, observer } from 'mobx-react';

import { sortBy } from 'lodash';
import DirectoryEntry from './DirectoryEntry/index';
import WorkspaceItem from '../WorkspaceItem';

import EditIcons from './DirectoryEntry/Entry/EditIcons';

class Files extends React.Component {
  createModule = () => {
    // INCREDIBLY BAD PRACTICE! TODO: FIX THIS
    this.directory.onCreateModuleClick();
  };

  createDirectory = () => {
    // INCREDIBLY BAD PRACTICE! TODO: FIX THIS
    this.directory.onCreateDirectoryClick();
  };

  uploadImage = () => {
    const fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');
    fileSelector.setAttribute('accept', 'image/*');
    fileSelector.onchange = event => {
      const file = event.target.files[0];
      if (!file) {
        return;
      }

      const payload = new FormData();
      payload.append('type', 'file');
      payload.append('image', file);

      fetch('https://api.imgur.com/3/upload.json', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: 'Client-ID dc708f3823b7756', // imgur specific
        },
        body: payload,
      })
        .then(response => {
          if (response.status === 200) {
            return response.json();
          }
          return Promise.reject(new Error(`Error uploading to imgur.`));
        })
        .then(json => {
          const code = json.data.link;
          const title = file.name;

          // create the file with the title it was uploaded as
          // this.directory.createModule(undefined, title, true, code);
        })
        .catch(error => console.error(`Failed to upload image: ${error}`));
    };
    fileSelector.click();
  };

  render() {
    const store = this.props.store;
    const sandbox = store.editor.currentSandbox;

    return (
      <WorkspaceItem
        defaultOpen
        keepState
        title="Files"
        actions={
          <EditIcons
            hovering
            onCreateFile={this.createModule}
            onCreateDirectory={this.createDirectory}
          />
        }
      >
        <DirectoryEntry
          root
          innerRef={el => {
            this.directory = el;
          }}
          title={sandbox.title || 'Project'}
          sandboxId={sandbox.id}
          sandboxTemplate={sandbox.template}
          mainModuleId={store.editor.mainModule.id}
          modules={sortBy(sandbox.modules.toJS(), 'title')}
          directories={sortBy(sandbox.directories.toJS(), 'title')}
          isInProjectView={store.preferences.isInProjectView}
          currentModuleId={store.editor.currentModule.id}
          errors={store.editor.errors}
          corrections={store.editor.corrections}
          depth={-1}
          id={null}
          shortid={null}
        />
      </WorkspaceItem>
    );
  }
}

export default inject('signals', 'store')(observer(Files));
