/// <reference path='../common/Commits.d.ts' />

import * as React from 'react';
import * as classNames from 'classnames';
import * as moment from 'moment';
import { observer } from 'mobx-react';

import Row from './row/Row';
import Footer from './footer/Footer';
import Header from './header/Header';
import Note from './note/Note';
import { revertDialog } from '../portal/portal';
import { findIndex } from '../../utils/ArrayUtils';

import CommitRow from '../../stores/CommitRow';
import { AppStore } from '../../stores/appStore';
import { CommitsTableStore } from '../../stores/commitsTableStore';

import './CommitsTable.less';

interface CommitsTableProps {
  appStore?: AppStore;
  commitsTableStore?: CommitsTableStore;
}

@observer(['appStore', 'commitsTableStore'])
export default class CommitsTable extends React.Component<CommitsTableProps, {}> {

  onSelectAllChange = (isChecked: boolean) => {
    const { commitsTableStore } = this.props;

    this.onCommitsSelect(commitsTableStore.commits, isChecked, false);
  };

  onUndo = (hash: string, message: string) => {
    const { commitsTableStore } = this.props;
    const title = (
      <span>Undo <em>{message}</em>?</span>
    );

    revertDialog(title, () => commitsTableStore.undoCommits([hash]));
  };

  onRollback = (hash: string, date: string) => {
    const { commitsTableStore } = this.props;
    const title = (
      <span>Roll back to <em>{moment(date).format('LLL')}</em>?</span>
    );

    revertDialog(title, () => commitsTableStore.rollbackToCommit(hash));
  };

  onCommitsSelect = (commitsToSelect: Commit[], isChecked: boolean, isShiftKey: boolean) => {
    const { commitsTableStore } = this.props;
    commitsTableStore.selectCommits(commitsToSelect, isChecked, isShiftKey);
  };

  renderRow = (commitRow: CommitRow, displayNotAbleNote: boolean) => {
    const { commitsTableStore } = this.props;
    const row = (
      <Row
        commitRow={commitRow}
        enableActions={commitsTableStore.enableActions}
        onUndo={this.onUndo}
        onRollback={this.onRollback}
        onCommitsSelect={this.onCommitsSelect}
        key={commitRow.commit.hash}
      />
    );

    if (displayNotAbleNote) {
      return [
        <Note key='note'>
          VersionPress is not able to undo changes made before it has been activated.
        </Note>,
        row,
      ];
    }

    return [row];
  };

  render() {
    const { commitsTableStore } = this.props;
    const {
      pages,
      commits,
      commitRows,
      enableActions,
      selectableCommits,
      areAllCommitsSelected,
      isLoading,
    } = commitsTableStore;

    const commitsTableClassName = classNames({
      'vp-table': true,
      'widefat': true,
      'fixed': true,
      'loading': isLoading,
    });

    const notAbleNoteIndex = findIndex(commits, (commit: Commit, index: number) => (
      !commit.isEnabled && index < commits.length - 1
    ));

    return (
      <table className={commitsTableClassName}>
        <Header
          areAllCommitsSelected={areAllCommitsSelected}
          selectableCommitsCount={selectableCommits.length}
          enableActions={enableActions}
          onSelectAllChange={this.onSelectAllChange}
        />
        {commitRows.map((commitRow: CommitRow, index: number) => (
          this.renderRow(commitRow, index === notAbleNoteIndex)
        ))}
        <Footer pages={pages} />
      </table>
    );
  }

}
