import { Component, input, model } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { Tree } from 'primeng/tree';

@Component({
  selector: 'hta-scope-tree',
  imports: [Tree],
  templateUrl: './scope-tree.html',
  styleUrl: './scope-tree.css',
})
export class ScopeTree {
  nodes = input.required<TreeNode[]>();
  selectedNodes = model<TreeNode[]>([]);
}
