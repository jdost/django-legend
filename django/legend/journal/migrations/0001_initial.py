# encoding: utf-8
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models

class Migration(SchemaMigration):

    def forwards(self, orm):
        
        # Adding model 'Tag'
        db.create_table('journal_tag', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=30)),
            ('url', self.gf('django.db.models.fields.SlugField')(max_length=30, db_index=True)),
        ))
        db.send_create_signal('journal', ['Tag'])

        # Adding model 'Journal'
        db.create_table('journal_journal', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('date', self.gf('django.db.models.fields.DateTimeField')()),
            ('content', self.gf('django.db.models.fields.TextField')()),
            ('url', self.gf('django.db.models.fields.SlugField')(max_length=50, db_index=True)),
        ))
        db.send_create_signal('journal', ['Journal'])

        # Adding M2M table for field tags on 'Journal'
        db.create_table('journal_journal_tags', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('journal', models.ForeignKey(orm['journal.journal'], null=False)),
            ('tag', models.ForeignKey(orm['journal.tag'], null=False))
        ))
        db.create_unique('journal_journal_tags', ['journal_id', 'tag_id'])

        # Adding model 'Comment'
        db.create_table('journal_comment', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('author', self.gf('django.db.models.fields.CharField')(max_length=30)),
            ('content', self.gf('django.db.models.fields.TextField')()),
            ('time', self.gf('django.db.models.fields.DateTimeField')()),
            ('entry', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['journal.Journal'])),
        ))
        db.send_create_signal('journal', ['Comment'])


    def backwards(self, orm):
        
        # Deleting model 'Tag'
        db.delete_table('journal_tag')

        # Deleting model 'Journal'
        db.delete_table('journal_journal')

        # Removing M2M table for field tags on 'Journal'
        db.delete_table('journal_journal_tags')

        # Deleting model 'Comment'
        db.delete_table('journal_comment')


    models = {
        'journal.comment': {
            'Meta': {'object_name': 'Comment'},
            'author': ('django.db.models.fields.CharField', [], {'max_length': '30'}),
            'content': ('django.db.models.fields.TextField', [], {}),
            'entry': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['journal.Journal']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'time': ('django.db.models.fields.DateTimeField', [], {})
        },
        'journal.journal': {
            'Meta': {'object_name': 'Journal'},
            'content': ('django.db.models.fields.TextField', [], {}),
            'date': ('django.db.models.fields.DateTimeField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'tags': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['journal.Tag']", 'symmetrical': 'False'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'url': ('django.db.models.fields.SlugField', [], {'max_length': '50', 'db_index': 'True'})
        },
        'journal.tag': {
            'Meta': {'object_name': 'Tag'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '30'}),
            'url': ('django.db.models.fields.SlugField', [], {'max_length': '30', 'db_index': 'True'})
        }
    }

    complete_apps = ['journal']
